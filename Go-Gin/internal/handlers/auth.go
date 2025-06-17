package handlers

import (
	"net/http"

	"bookmark-shortener/ent"
	"bookmark-shortener/ent/user"
	"bookmark-shortener/internal/models"
	"bookmark-shortener/internal/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	client *ent.Client
	secret []byte
}

func NewAuthHandler(client *ent.Client, secret string) *AuthHandler {
	return &AuthHandler{
		client: client,
		secret: []byte(secret),
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	exists, err := h.client.User.Query().Where(user.Email(req.Email)).Exist(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	u, err := h.client.User.Create().
		SetEmail(req.Email).
		SetPasswordHash(hashedPassword).
		Save(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":    u.ID,
		"email": u.Email,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	u, err := h.client.User.Query().Where(user.Email(req.Email)).Only(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := utils.CheckPassword(u.PasswordHash, req.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT
	tokenString, err := utils.GenerateToken(u.ID.String(), h.secret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenString,
		"token_type":   "bearer",
	})
}
