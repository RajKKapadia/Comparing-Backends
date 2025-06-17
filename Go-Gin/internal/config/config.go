package config

import (
	"context"
	"database/sql"
	"log"
	"os"

	"bookmark-shortener/ent"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/lib/pq"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
	BaseURL     string
}

func New() *Config {
	return &Config{
		DatabaseURL: getEnv("DATABASE_URL", ""),
		JWTSecret:   getEnv("JWT_SECRET", ""),
		Port:        getEnv("PORT", "8080"),
		BaseURL:     getEnv("BASE_URL", "http://127.0.0.1:8080"),
	}
}

func (c *Config) InitDB() (*ent.Client, error) {
	log.Println(c.DatabaseURL)
	db, err := sql.Open("postgres", c.DatabaseURL)
	if err != nil {
		return nil, err
	}

	drv := entsql.OpenDB(dialect.Postgres, db)
	client := ent.NewClient(ent.Driver(drv))

	// Test connection
	if err := client.Schema.Create(context.Background()); err != nil {
		return nil, err
	}

	return client, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
