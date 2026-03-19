package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type BlogRequest struct {
	Title   string `json:"title"`
	Slug    string `json:"slug"`
	Excerpt string `json:"excerpt"`
	Content string `json:"content"`
	Image   string `json:"image"`
	Status  string `json:"status"`
}

func main() {
	// Get API URL from environment or use default
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8080/api"
	}

	// Get token from environment (you need to set this after logging in)
	token := os.Getenv("AUTH_TOKEN")
	if token == "" {
		fmt.Println("Error: AUTH_TOKEN environment variable is required")
		fmt.Println("Please login first and get your token, then set it as:")
		fmt.Println("export AUTH_TOKEN=your_token_here")
		os.Exit(1)
	}

	// Sample blog data
	blog := BlogRequest{
		Title: "Welcome to Our Dating Platform - Find Your Perfect Match",
		Slug:  "welcome-to-our-dating-platform",
		Excerpt: "Discover how our innovative matching system helps you find meaningful connections. Join thousands of happy couples who found love through our platform.",
		Content: `Finding love in the digital age has never been easier! Our platform uses advanced algorithms to match you with compatible partners based on your interests, values, and lifestyle.

## Why Choose Us?

Our dating platform stands out from the rest with:

1. **Smart Matching Algorithm**: We use AI-powered technology to analyze compatibility factors and suggest the best matches for you.

2. **Verified Profiles**: All our members go through a verification process to ensure authenticity and safety.

3. **Privacy First**: Your data is protected with industry-leading security measures.

4. **Active Community**: Join a vibrant community of singles looking for meaningful relationships.

## Getting Started

Creating your profile is simple:

- Sign up in minutes
- Complete your profile with photos and interests
- Start browsing matches
- Connect and chat with potential partners

## Success Stories

Thousands of couples have found love through our platform. From first dates to engagements, we're here to help you find your perfect match.

Ready to start your journey? Sign up today and discover what makes us different!`,
		Image:  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
		Status: "published",
	}

	// Convert to JSON
	jsonData, err := json.Marshal(blog)
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		os.Exit(1)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", apiURL+"/admin/blogs", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		os.Exit(1)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error sending request: %v\n", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		os.Exit(1)
	}

	// Print result
	if resp.StatusCode == http.StatusCreated {
		fmt.Println("✅ Blog created successfully!")
		fmt.Println("\nResponse:")
		fmt.Println(string(body))
	} else {
		fmt.Printf("❌ Error creating blog (Status: %d)\n", resp.StatusCode)
		fmt.Println("Response:", string(body))
		os.Exit(1)
	}
}







