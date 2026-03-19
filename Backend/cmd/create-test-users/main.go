package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

type RegisterRequest struct {
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type RegisterResponse struct {
	Token string `json:"token"`
	User  struct {
		ID        string `json:"id"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	} `json:"user"`
}

func main() {
	baseURL := "http://localhost:8080/api/auth/register"

	// User 1: Alice
	alice := RegisterRequest{
		Username:  "alice",
		Email:     "alice@test.com",
		Password:  "password123",
		FirstName: "Alice",
		LastName:  "Smith",
	}

	// User 2: Bob
	bob := RegisterRequest{
		Username:  "bob",
		Email:     "bob@test.com",
		Password:  "password123",
		FirstName: "Bob",
		LastName:  "Johnson",
	}

	fmt.Println("🚀 Creating test users...\n")

	// Create Alice
	fmt.Println("Creating User 1: Alice...")
	aliceResp := createUser(baseURL, alice)
	if aliceResp != nil {
		fmt.Printf("✅ Alice created successfully!\n")
		fmt.Printf("   ID: %s\n", aliceResp.User.ID)
		fmt.Printf("   Username: %s\n", aliceResp.User.Username)
		fmt.Printf("   Email: %s\n", aliceResp.User.Email)
	} else {
		fmt.Println("❌ Failed to create Alice (user may already exist)")
	}

	fmt.Println()

	// Create Bob
	fmt.Println("Creating User 2: Bob...")
	bobResp := createUser(baseURL, bob)
	if bobResp != nil {
		fmt.Printf("✅ Bob created successfully!\n")
		fmt.Printf("   ID: %s\n", bobResp.User.ID)
		fmt.Printf("   Username: %s\n", bobResp.User.Username)
		fmt.Printf("   Email: %s\n", bobResp.User.Email)
	} else {
		fmt.Println("❌ Failed to create Bob (user may already exist)")
	}

	fmt.Println("\n" + strings.Repeat("=", 80))
	fmt.Println("📋 TEST USER CREDENTIALS")
	fmt.Println(strings.Repeat("=", 80))
	fmt.Println()
	fmt.Println("👤 USER 1 - ALICE")
	fmt.Println("   Email:    alice@test.com")
	fmt.Println("   Password: password123")
	fmt.Println("   Username: alice")
	fmt.Println()
	fmt.Println("👤 USER 2 - BOB")
	fmt.Println("   Email:    bob@test.com")
	fmt.Println("   Password: password123")
	fmt.Println("   Username: bob")
	fmt.Println()
	fmt.Println(strings.Repeat("=", 80))
	fmt.Println()
	fmt.Println("💬 TO START CHATTING:")
	fmt.Println("   1. Login as Alice in one browser/tab")
	fmt.Println("   2. Login as Bob in another browser/tab (or incognito)")
	fmt.Println("   3. Use GraphQL mutation createDMChat to create a chat between them")
	fmt.Println("   4. Start sending messages!")
	fmt.Println()
}

func createUser(url string, user RegisterRequest) *RegisterResponse {
	jsonData, err := json.Marshal(user)
	if err != nil {
		fmt.Printf("Error marshaling JSON: %v\n", err)
		return nil
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return nil
	}

	if resp.StatusCode != http.StatusCreated {
		fmt.Printf("Error: %s\n", string(body))
		return nil
	}

	var registerResp RegisterResponse
	if err := json.Unmarshal(body, &registerResp); err != nil {
		fmt.Printf("Error unmarshaling response: %v\n", err)
		return nil
	}

	return &registerResp
}

