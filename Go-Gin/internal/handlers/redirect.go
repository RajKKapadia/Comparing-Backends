package handlers

import (
	"log"
	"net/http"

	"bookmark-shortener/ent"
	"bookmark-shortener/ent/bookmark"

	"github.com/gin-gonic/gin"
)

type RedirectHandler struct {
	client *ent.Client
}

func NewRedirectHandler(client *ent.Client) *RedirectHandler {
	return &RedirectHandler{client: client}
}

func (h *RedirectHandler) Redirect(c *gin.Context) {
	shortCode := c.Param("code")

	b, err := h.client.Bookmark.Query().
		Where(bookmark.ShortCode(shortCode)).
		Only(c)
	if err != nil {
		if ent.IsNotFound(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Short URL not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	// Increment visit count
	_, err = h.client.Bookmark.UpdateOneID(b.ID).
		SetVisitCount(b.VisitCount + 1).
		Save(c)
	if err != nil {
		log.Printf("Failed to update visit count: %v", err)
	}

	c.Redirect(http.StatusFound, b.URL)
}
