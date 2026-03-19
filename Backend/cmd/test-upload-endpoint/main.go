package main

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func main() {
	// Test the upload endpoint
	fmt.Println("Testing image upload endpoint...")
	
	// Create a test image file (1x1 pixel PNG)
	testImageData := []byte{
		0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
		0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
		0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
		0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
		0x01, 0x00, 0x01, 0x02, 0x1A, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
		0x44, 0xAE, 0x42, 0x60, 0x82,
	}
	
	// Create multipart form
	var b bytes.Buffer
	writer := multipart.NewWriter(&b)
	
	// Add the image file
	part, err := writer.CreateFormFile("image", "test.png")
	if err != nil {
		fmt.Printf("Error creating form file: %v\n", err)
		return
	}
	
	_, err = part.Write(testImageData)
	if err != nil {
		fmt.Printf("Error writing image data: %v\n", err)
		return
	}
	
	writer.Close()
	
	// Make the request
	req, err := http.NewRequest("POST", "http://localhost:8080/api/admin/blogs/upload-image", &b)
	if err != nil {
		fmt.Printf("Error creating request: %v\n", err)
		return
	}
	
	req.Header.Set("Content-Type", writer.FormDataContentType())
	// Note: This test doesn't include auth token, so it will fail with 401
	// But it will test if the server is running and the endpoint exists
	
	client := &http.Client{}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("Error making request: %v\n", err)
		fmt.Println("This likely means the backend server is not running.")
		fmt.Println("Please start the backend server with: go run main.go")
		return
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return
	}
	
	fmt.Printf("Response Status: %s\n", resp.Status)
	fmt.Printf("Response Body: %s\n", string(body))
	
	if resp.StatusCode == 401 {
		fmt.Println("✓ Server is running and endpoint exists (401 = auth required, which is expected)")
	} else if resp.StatusCode == 200 {
		fmt.Println("✓ Upload successful!")
	} else {
		fmt.Printf("✗ Unexpected status code: %d\n", resp.StatusCode)
	}
}