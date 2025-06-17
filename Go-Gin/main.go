package main

import (
	"log"

	"bookmark-shortener/internal/config"
	"bookmark-shortener/internal/handlers"
	"bookmark-shortener/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.New()

	// Initialize database and Ent client
	client, err := cfg.InitDB()
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer client.Close()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(client, cfg.JWTSecret)
	bookmarkHandler := handlers.NewBookmarkHandler(client)
	redirectHandler := handlers.NewRedirectHandler(client)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)

	// Setup routes
	r := gin.Default()

	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/token", authHandler.Login)
	}

	// Protected bookmark routes
	bookmarks := r.Group("/bookmarks")
	bookmarks.Use(authMiddleware.RequireAuth())
	{
		bookmarks.POST("/create", bookmarkHandler.Create)
		bookmarks.GET("/get", bookmarkHandler.GetAll)
		bookmarks.GET("/get/:id", bookmarkHandler.GetByID)
		bookmarks.DELETE("/delete/:id", bookmarkHandler.Delete)
	}

	// Short URL redirect
	r.GET("/:code", redirectHandler.Redirect)

	log.Printf("Server starting on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
