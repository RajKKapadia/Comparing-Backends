package main

import (
	"context"
	"log"

	"bookmark-shortener/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	cfg := config.New()
	client, err := cfg.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer client.Close()

	// Run migrations
	if err := client.Schema.Create(context.Background()); err != nil {
		log.Fatal("Failed to create schema:", err)
	}

	log.Println("Schema created successfully")
}
