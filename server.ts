import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import cors from "cors";

import crypto from "crypto";
import OpenAI from "openai";

import { getDb } from "./src/db/index.js";
import { users, searchHistory, developerPlugins } from "./src/db/schema.js";
import { eq, desc } from "drizzle-orm";

dotenv.config();

const pkceStates = new Map<string, string>();

const nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "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",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const app = express();

app.use(express.json());
app.use(cors());

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });
      
      const db = getDb();

      // Check if user exists
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) return res.status(400).json({ error: "Email already in use" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const created = await db.insert(users).values({
        email,
        password: hashedPassword,
        onboarding_completed: false
      }).returning();

      res.json(created[0]);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to signup" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const db = getDb();

      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) return res.status(401).json({ error: "Invalid credentials" });

      const validPassword = await bcrypt.compare(password, user[0].password);
      if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

      res.json(user[0]);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Google OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: "GOOGLE_CLIENT_ID not configured" });
    }
    const redirectUri = `${process.env.APP_URL || 'https://' + req.get('host')}/api/auth/google/url`; // Wait, should it be callback?
    // Let me check the callback route
    const actualRedirectUri = `${process.env.APP_URL || 'https://' + req.get('host')}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: actualRedirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Code missing");

    try {
      const redirectUri = `${process.env.APP_URL || 'https://' + req.get('host')}/api/auth/google/callback`;
      
      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokens = await tokenRes.json();
      if (!tokens.access_token) {
        console.error("Token exchange failed:", tokens);
        throw new Error("Failed to exchange code for tokens");
      }

      // Get user info
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const googleUser = await userRes.json();

      const db = getDb();

      // Find or create user
      const existingUsers = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1);
      
      let finalUser;
      if (existingUsers.length === 0) {
        // Create user (no password for OAuth users)
        const created = await db.insert(users).values({
          email: googleUser.email,
          password: 'oauth_user', // Placeholder
          nickname: googleUser.name || googleUser.given_name,
          onboarding_completed: false
        }).returning();
        finalUser = created[0];
      } else {
        finalUser = existingUsers[0];
      }

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(finalUser)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // GitHub OAuth Routes
  app.get("/api/auth/github/url", (req, res) => {
    const redirectUri = process.env.APP_URL 
      ? `${process.env.APP_URL}/api/auth/github/callback`
      : `${req.protocol}://${req.get("host")}/api/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: "user:email repo",
    });
    const authUrl = `https://github.com/login/oauth/authorize?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Code missing");

    try {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        }),
      });

      const tokens = await tokenRes.json();
      if (!tokens.access_token) throw new Error("Failed to exchange code for tokens");

      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const githubUser = await userRes.json();

      let email = githubUser.email;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const emails = await emailsRes.json();
        email = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
      }

      const db = getDb();

      const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      let finalUser;
      if (existingUsers.length === 0) {
        const created = await db.insert(users).values({
          email: email!,
          password: 'oauth_user',
          nickname: githubUser.name || githubUser.login,
          onboarding_completed: false
        }).returning();
        finalUser = created[0];
      } else {
        finalUser = existingUsers[0];
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${tokens.access_token}', user: ${JSON.stringify(finalUser)} }, '*');
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(finalUser)} }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Canva OAuth Routes
  app.get("/api/auth/canva/url", (req, res) => {
    const state = crypto.randomBytes(16).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    
    pkceStates.set(state, codeVerifier);
    
    // Cleanup old states
    if (pkceStates.size > 100) {
      const firstKey = pkceStates.keys().next().value;
      if (firstKey) pkceStates.delete(firstKey);
    }

    const redirectUri = process.env.APP_URL 
      ? `${process.env.APP_URL}/api/auth/canva/callback`
      : `${req.protocol}://${req.get("host")}/api/auth/canva/callback`;

    const params = new URLSearchParams({
      client_id: process.env.CANVA_CLIENT_ID || 'OC-AZ9ZaYxOf6v_',
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "design:meta:read folder:permission:read asset:read brandtemplate:meta:read folder:read design:content:read design:permission:read brandtemplate:content:read app:read comment:read profile:read",
      code_challenge: codeChallenge,
      code_challenge_method: "s256",
      state: state
    });
    const authUrl = `https://www.canva.com/api/oauth/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/canva/callback", async (req, res) => {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send("Code or state missing");

    const codeVerifier = pkceStates.get(state as string);
    if (!codeVerifier) return res.status(400).send("Invalid or expired state");
    pkceStates.delete(state as string);

    try {
      const clientId = process.env.CANVA_CLIENT_ID || 'OC-AZ9ZaYxOf6v_';
      const clientSecret = process.env.CANVA_CLIENT_SECRET;
      
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const redirectUri = process.env.APP_URL 
        ? `${process.env.APP_URL}/api/auth/canva/callback`
        : `${req.protocol}://${req.get("host")}/api/auth/canva/callback`;

      const tokenResponse = await fetch("https://api.canva.com/rest/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        }).toString()
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error("Canva token error:", tokenData);
        return res.status(tokenResponse.status || 400).send(`Failed to exchange token: ${JSON.stringify(tokenData)}`);
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'CANVA_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Canva OAuth error:", error);
      res.status(500).send("An error occurred during authentication.");
    }
  });

  // Check if API key is provided
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post("/api/fix-speech", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.json({ fixedText: '' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ fixedText: text }); // Fallback if no key
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Fix the following transcribed speech for a search query. Make it grammatically correct and clear, but do not change the core meaning. Only return the corrected text, nothing else.\n\nSpeech: "${text}"`,
      });
      
      const fixedText = response.text?.trim() || text;
      res.json({ fixedText });
    } catch (error) {
      console.error("Fix speech error:", error);
      res.status(500).json({ error: "Failed to fix speech" });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      const { query, history, personalization, plugin, notionToken, githubToken, canvaToken } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      let searchContext = "";
      let sources: any[] = [];
      let images: string[] = [];
      
      if (plugin === 'notion' && notionToken) {
        try {
          const notionRes = await fetch("https://api.notion.com/v1/search", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${notionToken}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              query: query,
              sort: {
                direction: "descending",
                timestamp: "last_edited_time"
              },
              page_size: 5
            })
          });
          const notionData = await notionRes.json();
          if (notionData.results) {
             const results = await Promise.all(notionData.results.map(async (r: any) => {
               let title = "Untitled";
               if (r.properties) {
                 for (const key in r.properties) {
                   if (r.properties[key].type === "title" && r.properties[key].title.length > 0) {
                     title = r.properties[key].title[0].plain_text;
                     break;
                   }
                 }
               }
               
               // Fetch page content (blocks)
               let content = "";
               try {
                 const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${r.id}/children?page_size=10`, {
                   headers: {
                     "Authorization": `Bearer ${notionToken}`,
                     "Notion-Version": "2022-06-28"
                   }
                 });
                 const blocksData = await blocksRes.json();
                 if (blocksData.results) {
                   content = blocksData.results.map((b: any) => {
                     if (b.type === 'paragraph' && b.paragraph.rich_text.length > 0) {
                       return b.paragraph.rich_text.map((t: any) => t.plain_text).join('');
                     }
                     if (b.type === 'heading_1' && b.heading_1.rich_text.length > 0) {
                       return b.heading_1.rich_text.map((t: any) => t.plain_text).join('');
                     }
                     if (b.type === 'heading_2' && b.heading_2.rich_text.length > 0) {
                       return b.heading_2.rich_text.map((t: any) => t.plain_text).join('');
                     }
                     if (b.type === 'heading_3' && b.heading_3.rich_text.length > 0) {
                       return b.heading_3.rich_text.map((t: any) => t.plain_text).join('');
                     }
                     if (b.type === 'bulleted_list_item' && b.bulleted_list_item.rich_text.length > 0) {
                       return "- " + b.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
                     }
                     return '';
                   }).filter(Boolean).join('\n');
                 }
               } catch (e) {
                 console.error("Failed to fetch blocks", e);
               }
               
               return {
                 title,
                 url: r.url,
                 id: r.id,
                 content: content
               };
             }));
             searchContext = "Notion Workspace Search Results:\n" + JSON.stringify(results, null, 2);
             sources = results.map((r: any) => ({ uri: r.url, title: r.title }));
          }
        } catch(err) {
          console.error("Notion search error:", err);
        }
      } else if (plugin === 'github' && githubToken) {
        try {
          const githubRes = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, {
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "atmos-ai-app"
            }
          });
          const githubData = await githubRes.json();
          let results: any[] = [];
          if (githubData.items) {
             results = githubData.items.map((r: any) => {
               return {
                 type: "repository",
                 title: r.full_name,
                 url: r.html_url,
                 description: r.description,
                 stars: r.stargazers_count,
                 language: r.language
               };
             });
          }
          
          // Also search issues
          const issuesRes = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=5`, {
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "atmos-ai-app"
            }
          });
          const issuesData = await issuesRes.json();
          if (issuesData.items) {
             const issueResults = issuesData.items.map((r: any) => {
               return {
                 type: r.pull_request ? "pull_request" : "issue",
                 title: r.title,
                 url: r.html_url,
                 state: r.state,
                 repository: r.repository_url?.split('/').slice(-2).join('/'),
                 body: r.body?.substring(0, 300)
               };
             });
             results = [...results, ...issueResults];
          }
          
          if (results.length > 0) {
             searchContext = "GitHub Search Results (Repositories & Issues):\n" + JSON.stringify(results, null, 2);
             sources = results.map((r: any) => ({ uri: r.url, title: r.title }));
          }
        } catch(err) {
          console.error("GitHub search error:", err);
        }
      } else if (plugin === 'canva' && canvaToken) {
        try {
          // Note: Canva Connect API provides /v1/folders or /v1/designs, this is a conceptual placeholder API endpoint since exact search endpoint isn't standard, assuming we fetch recent designs.
          const canvaRes = await fetch("https://api.canva.com/rest/v1/designs", {
            headers: {
              "Authorization": `Bearer ${canvaToken}`,
              "Accept": "application/json"
            }
          });
          if (canvaRes.ok) {
            const canvaData = await canvaRes.json();
            if (canvaData.items) {
               const results = canvaData.items.map((r: any) => {
                 return {
                   id: r.id,
                   title: r.title,
                   url: r.urls?.view_url || r.urls?.edit_url,
                   thumbnail: r.thumbnail?.url
                 };
               });
               searchContext = "Canva Designs:\n" + JSON.stringify(results, null, 2);
               sources = results.map((r: any) => ({ uri: r.url, title: r.title }));
               images = results.filter((r: any) => r.thumbnail).map((r: any) => r.thumbnail);
            }
          }
        } catch(err) {
          console.error("Canva search error:", err);
        }
      } else {
        if (process.env.TAVILY_API_KEY) {
          try {
            const tavilyRes = await fetch("https://api.tavily.com/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                max_results: 5,
                include_images: true
              })
            });
            const tavilyData = await tavilyRes.json();
            if (tavilyData.results) {
               searchContext = "Search Results:\n" + JSON.stringify(tavilyData.results, null, 2);
               sources = tavilyData.results.map((r: any) => ({ uri: r.url, title: r.title }));
            }
            if (tavilyData.images && Array.isArray(tavilyData.images)) {
               images = tavilyData.images;
            }
          } catch (err) {
            console.error("Tavily search error:", err);
          }
        } else {
          console.warn("WARNING: TAVILY_API_KEY not set. Falling back to ungrounded generation.");
        }

        // Foursquare Places API Integration
        if (process.env.FOURSQUARE_API_KEY) {
          try {
            const intentSchema = {
              type: Type.OBJECT,
              properties: {
                isPlacesSearch: { 
                  type: Type.BOOLEAN, 
                  description: "True if the query is seeking real-world places, venues, restaurants, hotels, parks, attractions, or shops." 
                },
                searchTerm: { 
                  type: Type.STRING, 
                  description: "The name, type, or category of place, e.g. 'sushi', 'Eiffel Tower', 'parks', 'coffee'." 
                },
                extractedLocation: { 
                  type: Type.STRING, 
                  description: "The specific location/city/country mentioned in the query (e.g. 'Chicago', 'New York', 'Paris', 'near here'). Leave empty if no specific location is mentioned in the query itself." 
                }
              },
              required: ["isPlacesSearch", "searchTerm"]
            };
            
            const intentRes = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: `Analyze the user's query and extract if it's searching for real-world places/venues, the search term, and any explicitly mentioned location.\n\nQuery: "${query}"`,
              config: {
                responseMimeType: "application/json",
                responseSchema: intentSchema
              }
            });
            
            const intentData = JSON.parse(intentRes.text || "{}");
            
            if (intentData.isPlacesSearch) {
              const searchQuery = intentData.searchTerm || query;
              let locationQuery = "";
              if (intentData.extractedLocation && !intentData.extractedLocation.toLowerCase().includes("near me") && !intentData.extractedLocation.toLowerCase().includes("near here")) {
                locationQuery = `near=${encodeURIComponent(intentData.extractedLocation)}`;
              } else if (personalization?.userCoordinates) {
                locationQuery = `ll=${personalization.userCoordinates}`;
              } else if (personalization?.userLocation) {
                locationQuery = `near=${encodeURIComponent(personalization.userLocation)}`;
              } else {
                locationQuery = `near=San Francisco, CA`;
              }
              
              const fsqUrl = `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(searchQuery)}&${locationQuery}&fields=fsq_id,name,location,categories,photos,rating,description&limit=5`;
              
              const fsqRes = await fetch(fsqUrl, {
                headers: {
                  'Authorization': process.env.FOURSQUARE_API_KEY,
                  'Accept': 'application/json'
                }
              });
              
              if (fsqRes.ok) {
                const fsqData = await fsqRes.json();
                if (fsqData.results && fsqData.results.length > 0) {
                  const places = fsqData.results.map((place: any) => {
                    let photoUrl = null;
                    if (place.photos && place.photos.length > 0) {
                      photoUrl = `${place.photos[0].prefix}original${place.photos[0].suffix}`;
                    }
                    return {
                      name: place.name,
                      category: place.categories?.[0]?.name,
                      address: place.location?.formatted_address,
                      rating: place.rating,
                      description: place.description,
                      photo: photoUrl
                    };
                  });
                  
                  searchContext += "\n\nLocal Places (Foursquare):\n" + JSON.stringify(places, null, 2);
                  
                  places.forEach((p: any) => {
                    if (p.name) {
                      sources.push({ uri: "https://foursquare.com/", title: `Foursquare: ${p.name}` });
                    }
                    if (p.photo) {
                      images.push(p.photo);
                    }
                  });
                } else {
                  searchContext += "\n\nLocal Places (Foursquare): No places found for this location.";
                }
              } else {
                console.error("Foursquare API returned status:", fsqRes.status);
                searchContext += `\n\nLocal Places (Foursquare): Failed to fetch. Status code: ${fsqRes.status}.`;
              }
            }
          } catch (err) {
            console.error("Foursquare search error:", err);
          }
        }
      }

      // Notion Integration
      if (personalization?.notionToken) {
        try {
          const notionRes = await fetch("https://api.notion.com/v1/search", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${personalization.notionToken}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              query: query,
              page_size: 5
            })
          });
          if (notionRes.ok) {
            const notionData = await notionRes.json();
            if (notionData.results && notionData.results.length > 0) {
              const parsedNotion = notionData.results.map((r: any) => {
                // Try to find a title property. In Notion, the key containing the title varies.
                let title = "Untitled Page";
                if (r.properties) {
                  for (const key in r.properties) {
                    if (r.properties[key].type === 'title') {
                      title = r.properties[key].title?.[0]?.plain_text || "Untitled Page";
                      break;
                    }
                  }
                }
                return { title, url: r.url };
              });
              searchContext += "\n\nNotion Workspace Results:\n" + JSON.stringify(parsedNotion, null, 2);
              sources = [...sources, ...parsedNotion.map((r: any) => ({ uri: r.url, title: r.title + " (Notion)" }))];
            }
          } else {
             console.error("Notion API returned status:", notionRes.status);
          }
        } catch (err) {
          console.error("Notion search error:", err);
        }
      }

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise overall summary answering the user's query."
          },
          sections: {
            type: Type.ARRAY,
            description: "Detailed sections breaking down the information. Always provide at least one section. Use markdown for content when appropriate.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The title of the section." },
                content: { type: Type.STRING, description: "The main content or details for this section. Use markdown if helpful." },
                type: { type: Type.STRING, description: "The type of content: 'text', 'list', 'code', or 'data'." }
              },
              required: ["title", "content", "type"]
            }
          },
          relatedQueries: {
            type: Type.ARRAY,
            description: "3-5 related follow-up search queries.",
            items: { type: Type.STRING }
          },
          showImages: {
            type: Type.BOOLEAN,
            description: "Set to true if the query is about people, animals, places, products, or other highly visual subjects where images are helpful."
          }
        },
        required: ["summary", "sections", "relatedQueries", "showImages"]
      };

      let systemInstruction = "You are a highly capable AI search engine. Provide a structured, well-organized response based ONLY on the provided search results (if any) and user context. Be objective, helpful, and concise. " +
        "IMPORTANT: When generating markdown tables, ensure you use proper markdown syntax with standard pipe symbols (|) and hyphens for headers, and ALWAYS include newline characters (\\n) between rows so they render correctly. Never collapse or put table rows or markdown formatting on a single line. Do not add raw HTML, random dashes, or lines (like long horizontal dividers '---' or '__') in your content unless requested. " +
        "Carefully decide if the user's query represents a highly visual subject (e.g. people, animals, specific products, maps, or scenery) where images are absolutely helpful. Set 'showImages' to true only if appropriate. NEVER show images for informational, technical, list-based, coding, or text-heavy search queries. For local searches (places, venues, restaurants), always set 'showImages' to true.";
      
      if (plugin === 'github') {
         systemInstruction += " You are searching GitHub repositories and issues. Use standard markdown links (e.g. [Repo Name](https://github.com/...)) which will be rendered with custom GitHub icons. Format code snippets using markdown code blocks. Summarize errors, bugs, or repo details efficiently.";
      } else if (plugin === 'notion') {
         systemInstruction += " You are searching the user's Notion workspace. Summarize their pages and notes accurately.";
      } else if (plugin === 'canva') {
         systemInstruction += " You are searching the user's Canva account. You can refer to their designs and use markdown image tags or links if appropriate.";
      }
      let userContext = "";

      if (personalization) {
        let p = "";
        
        if (personalization.personalIntelligenceEnabled && personalization.userLocation) {
          p += `User's Location: ${personalization.userLocation}. Use this context for local queries (e.g. weather, time, local events, nearby places).\n`;
        }

        if (personalization.aboutYou?.nickname) p += `User's nickname is ${personalization.aboutYou.nickname}.\n`;
        if (personalization.aboutYou?.occupation) p += `User's occupation is ${personalization.aboutYou.occupation}.\n`;
        if (personalization.aboutYou?.more) p += `More about user: ${personalization.aboutYou.more}.\n`;
        
        let style = [];
        if (personalization.tone && personalization.tone !== "Default") style.push(`Tone: ${personalization.tone}`);
        if (personalization.characteristics) {
          if (personalization.characteristics.warm !== "Default") style.push(`Warmth: ${personalization.characteristics.warm}`);
          if (personalization.characteristics.enthusiastic !== "Default") style.push(`Enthusiasm: ${personalization.characteristics.enthusiastic}`);
          if (personalization.characteristics.headers !== "Default") style.push(`Headers & Lists: ${personalization.characteristics.headers}`);
          if (personalization.characteristics.emoji !== "Default") style.push(`Emoji: ${personalization.characteristics.emoji}`);
        }
        if (style.length > 0) p += `Requested style constraints: ${style.join(', ')}.\n`;
        
        if (personalization.customInstructions) p += `Custom Instructions: ${personalization.customInstructions}\n`;

        if (p) {
           systemInstruction += `\n\nUSER PERSONALIZATION & PREFERENCES:\n${p}`;
        }
      }

      if (history && Array.isArray(history) && history.length > 0) {
         userContext = `\n\nConversation History:\n${history.map((h: any) => `- User asked: ${h.query}\n- Assistant answered: ${h.response || ''}`).join('\n')}`;
      }

      const prompt = `User Query: ${query}${userContext}\n\n${searchContext}`;

      const modelUsed = "gemini-3.1-flash-lite";
      const response = await ai.models.generateContent({
        model: modelUsed,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });
      const text = response.text;

      let data;
      try {
        const rawData = JSON.parse(text || "{}");
        // Ensure required fields exist to prevent client-side crashes
        data = {
          summary: rawData.summary || "No summary provided.",
          keyFindings: Array.isArray(rawData.keyFindings) ? rawData.keyFindings : [],
          sections: Array.isArray(rawData.sections) ? rawData.sections : [],
          relatedQueries: Array.isArray(rawData.relatedQueries) ? rawData.relatedQueries : [],
          showImages: !!rawData.showImages
        };
      } catch (err) {
        console.error(`Failed to parse JSON from ${modelUsed} response:`, text);
        return res.status(500).json({ error: "Failed to parse structured response from AI." });
      }

      // Save to search history if DB is configured
      let historyId = null;
      try {
        if (process.env.DATABASE_URL) {
          const db = getDb();
          
          // Try to get userId from headers or just save anonymously
          const userId = req.headers['x-user-id'] || req.body.userId;
          
          const saved = await db.insert(searchHistory).values({
            userId: userId as string || null,
            query: query,
            response: data,
            modelUsed: modelUsed,
          }).returning();
          historyId = saved[0].id;
        }
      } catch (err) {
        console.error("Failed to save search history:", err);
      }

      const isPlacesResult = searchContext.includes("Local Places (Foursquare)");

      res.json({
        id: historyId,
        result: data,
        sources: sources,
        images: (data.showImages || (isPlacesResult && images.length > 0)) ? images : [],
        modelUsed: modelUsed,
      });

    } catch (error: any) {
      console.error("Error generating search response:", error);
      res.status(500).json({ error: error.message || "An error occurred during the search." });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const { id, feedback } = req.body;
      if (!id || !feedback) return res.status(400).json({ error: "Missing id or feedback" });

      if (!process.env.DATABASE_URL) return res.json({ success: true, warning: "DB not configured" });

      const db = getDb();

      await db.update(searchHistory)
        .set({ feedback })
        .where(eq(searchHistory.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Notion OAuth Routes
  app.get("/api/auth/notion/url", (req, res) => {
    const redirectUri = process.env.APP_URL 
      ? `${process.env.APP_URL}/api/auth/notion/callback`
      : `${req.protocol}://${req.get("host")}/api/auth/notion/callback`;
    const params = new URLSearchParams({
      client_id: process.env.NOTION_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      owner: "user",
    });
    const authUrl = `https://api.notion.com/v1/oauth/authorize?${params}`;
    res.json({ url: authUrl });
  });

  app.get("/api/auth/notion/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).send("No authorization code provided.");
      }

      const clientId = process.env.NOTION_CLIENT_ID;
      const clientSecret = process.env.NOTION_CLIENT_SECRET;
      
      // We dynamically infer the redirect URI based on the request host 
      // or we can use a configured APP_URL.
      const redirectUri = process.env.APP_URL 
        ? `${process.env.APP_URL}/api/auth/notion/callback`
        : `${req.protocol}://${req.get("host")}/api/auth/notion/callback`;

      if (!clientId || !clientSecret) {
        return res.status(500).send("Notion OAuth credentials are not configured on the server.");
      }

      // Exchange the code for an access token
      const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error("Notion token error:", tokenData);
        return res.status(tokenResponse.status).send(`Failed to exchange token: ${JSON.stringify(tokenData)}`);
      }

      // For a real app, you would securely store tokenData.access_token here
      // linked to the user's session.
      console.log("Successfully authenticated with Notion! Access token:", tokenData.access_token);

      // Return a success page or redirect back to the applet
      res.send(`
        <html>
          <head><title>Notion Connected</title></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9f9f9;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
              <h2 style="color: #10b981; margin-top: 0;">Successfully Connected to Notion!</h2>
              <p style="color: #6b7280; margin-bottom: 24px;">You can now close this window and return to the app.</p>
              <button onclick="window.close()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 16px; cursor: pointer;">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'NOTION_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Notion OAuth error:", error);
      res.status(500).send("An error occurred during authentication.");
    }
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).send("No authorization code provided.");
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(500).send("GitHub OAuth credentials are not configured on the server.");
      }

      // Exchange the code for an access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error("GitHub token error:", tokenData);
        return res.status(tokenResponse.status || 400).send(`Failed to exchange token: ${JSON.stringify(tokenData)}`);
      }

      // For a real app, you would securely store tokenData.access_token here
      // linked to the user's session.
      console.log("Successfully authenticated with GitHub! Access token length:", tokenData.access_token?.length);

      // Return a success page or redirect back to the applet
      res.send(`
        <html>
          <head><title>GitHub Connected</title></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9f9f9;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
              <h2 style="color: #10b981; margin-top: 0;">Successfully Connected to GitHub!</h2>
              <p style="color: #6b7280; margin-bottom: 24px;">You can now close this window and return to the app.</p>
              <button onclick="window.close()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 16px; cursor: pointer;">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.status(500).send("An error occurred during authentication.");
    }
  });

  app.get("/api/auth/canva/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).send("No authorization code provided.");
      }

      const clientId = process.env.CANVA_CLIENT_ID;
      const clientSecret = process.env.CANVA_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(500).send("Canva OAuth credentials are not configured on the server.");
      }

      const redirectUri = process.env.APP_URL 
        ? `${process.env.APP_URL}/api/auth/canva/callback`
        : `${req.protocol}://${req.get("host")}/api/auth/canva/callback`;

      // Code verifier is required for Canva PKCE if implemented, assuming standard code exchange for now.
      // Note: Canva uses Basic auth for token exchange
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      
      const tokenResponse = await fetch("https://api.canva.com/rest/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri
        }).toString()
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        console.error("Canva token error:", tokenData);
        return res.status(tokenResponse.status || 400).send(`Failed to exchange token: ${JSON.stringify(tokenData)}`);
      }

      console.log("Successfully authenticated with Canva! Access token length:", tokenData.access_token?.length);

      // Return a success page or redirect back to the applet
      res.send(`
        <html>
          <head><title>Canva Connected</title></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9f9f9;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center;">
              <h2 style="color: #00c4cc; margin-top: 0;">Successfully Connected to Canva!</h2>
              <p style="color: #6b7280; margin-bottom: 24px;">You can now close this window and return to the app.</p>
              <button onclick="window.close()" style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 16px; cursor: pointer;">Close Window</button>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'CANVA_AUTH_SUCCESS', token: '${tokenData.access_token}' }, '*');
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Canva OAuth error:", error);
      res.status(500).send("An error occurred during authentication.");
    }
  });

  // Mock fallback for plugins when DATABASE_URL is not set
  let fallbackPlugins: any[] = [];

  app.get("/api/user/:id", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.status(500).json({ error: "DB not configured" });
      const db = getDb();
      const user = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
      if (user.length === 0) return res.status(404).json({ error: "User not found" });
      res.json(user[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.status(500).json({ error: "DB not configured" });
      const db = getDb();
      const { id, ...data } = req.body;

      if (id) {
        const updated = await db.update(users).set(data).where(eq(users.id, id)).returning();
        return res.json(updated[0]);
      } else {
        const created = await db.insert(users).values(data).returning();
        return res.json(created[0]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to save user" });
    }
  });

  app.get("/api/search-history/:userId", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.status(500).json({ error: "DB not configured" });
      const db = getDb();
      const history = await db.select().from(searchHistory)
        .where(eq(searchHistory.userId, req.params.userId))
        .orderBy(desc(searchHistory.createdAt))
        .limit(50);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/search-history", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) return res.status(500).json({ error: "DB not configured" });
      const db = getDb();
      const { userId, query } = req.body;
      const created = await db.insert(searchHistory).values({ userId, query }).returning();
      res.json(created[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to save search" });
    }
  });

  // MCP Developer Console Routes
  app.get("/api/developer/plugins", async (req, res) => {
    try {
      if (!process.env.DATABASE_URL) {
        return res.json({ plugins: fallbackPlugins, warning: "DATABASE_URL not configured. Using local mock state." });
      }
      const db = getDb();
      const pluginsList = await db.select().from(developerPlugins);
      res.json({ plugins: pluginsList });
    } catch (error) {
      console.error("Failed to fetch plugins:", error);
      res.status(500).json({ error: "Failed to fetch plugins" });
    }
  });

  app.post("/api/developer/plugins", async (req, res) => {
    try {
      const { name, description, iconUrl, mcpServerUrl, requiresAuth, authType, clientId, clientSecret } = req.body;
      if (!name || !description || !mcpServerUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!process.env.DATABASE_URL) {
        const newPlugin = {
          id: Math.random().toString(36).substring(7),
          name,
          description,
          iconUrl,
          mcpServerUrl,
          requiresAuth: !!requiresAuth,
          authType,
          clientId,
          clientSecret,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        fallbackPlugins.unshift(newPlugin);
        return res.json({ plugin: newPlugin, warning: "DATABASE_URL not configured. Using local mock state." });
      }

      const db = getDb();
      
      const newPlugin = await db.insert(developerPlugins).values({
        name,
        description,
        iconUrl,
        mcpServerUrl,
        requiresAuth: !!requiresAuth,
        authType,
        clientId,
        clientSecret
      }).returning();

      res.json({ plugin: newPlugin[0] });
    } catch (error) {
      console.error("Failed to create plugin:", error);
      res.status(500).json({ error: "Failed to create plugin" });
    }
  });

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only start the server if we're not running as a Vercel function
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

// Start the server if not imported as a module (e.g. for Vercel)
if (process.env.VERCEL !== "1") {
  startServer().catch(console.error);
}
