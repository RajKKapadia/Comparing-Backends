package handlers

import (
	"net/http"

	"bookmark-shortener/ent"
	"bookmark-shortener/ent/bookmark"
	"bookmark-shortener/ent/user"
	"bookmark-shortener/internal/models"
	"bookmark-shortener/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BookmarkHandler struct {
	client *ent.Client
}

func NewBookmarkHandler(client *ent.Client) *BookmarkHandler {
	return &BookmarkHandler{client: client}
}

func (h *BookmarkHandler) Create(c *gin.Context) {
	var req models.BookmarkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	shortCode := utils.GenerateShortCode()

	existingBookmark, err := h.client.Bookmark.Query().Where(bookmark.URL(req.URL)).Exist(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if existingBookmark {
		c.JSON(http.StatusConflict, gin.H{"error": "Bookmark already exists"})
		return
	}

	// Ensure unique short code
	for {
		exists, err := h.client.Bookmark.Query().Where(bookmark.ShortCode(shortCode)).Exist(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if !exists {
			break
		}
		shortCode = utils.GenerateShortCode()
	}

	ownerUUID, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	b, err := h.client.Bookmark.Create().
		SetTitle(req.Title).
		SetURL(req.URL).
		SetShortCode(shortCode).
		SetOwnerID(ownerUUID).
		Save(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bookmark"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":          b.ID,
		"title":       b.Title,
		"url":         b.URL,
		"short_code":  b.ShortCode,
		"short_url":   getBaseURL(c) + "/" + b.ShortCode,
		"visit_count": b.VisitCount,
		"created_at":  b.CreatedAt,
	})
}

func (h *BookmarkHandler) GetAll(c *gin.Context) {
	userID := c.GetString("user_id")

	ownerUUID, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	bookmarks, err := h.client.Bookmark.Query().
		Where(bookmark.HasOwnerWith(user.ID(ownerUUID))).
		All(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookmarks"})
		return
	}

	result := make([]gin.H, len(bookmarks))
	baseURL := getBaseURL(c)
	for i, b := range bookmarks {
		result[i] = gin.H{
			"id":          b.ID,
			"title":       b.Title,
			"url":         b.URL,
			"short_code":  b.ShortCode,
			"short_url":   baseURL + "/" + b.ShortCode,
			"visit_count": b.VisitCount,
			"created_at":  b.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, result)
}

func (h *BookmarkHandler) GetByID(c *gin.Context) {
	userID := c.GetString("user_id")
	ownerUUID, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	bookmarkID := c.Param("id")
	bookmarkUUID, err := uuid.Parse(bookmarkID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bookmark ID"})
		return
	}

	b, err := h.client.Bookmark.Query().
		Where(
			bookmark.ID(bookmarkUUID),
			bookmark.HasOwnerWith(user.ID(ownerUUID)),
		).
		Only(c)
	if err != nil {
		if ent.IsNotFound(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Bookmark not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          b.ID,
		"title":       b.Title,
		"url":         b.URL,
		"short_code":  b.ShortCode,
		"short_url":   getBaseURL(c) + "/" + b.ShortCode,
		"visit_count": b.VisitCount,
		"created_at":  b.CreatedAt,
	})
}

func (h *BookmarkHandler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")
	ownerUUID, u_err := uuid.Parse(userID)
	if u_err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	bookmarkID := c.Param("id")
	bookmarkUUID, b_err := uuid.Parse(bookmarkID)
	if b_err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bookmark ID"})
		return
	}

	var err = h.client.Bookmark.DeleteOneID(bookmarkUUID).
		Where(bookmark.HasOwnerWith(user.ID(ownerUUID))).
		Exec(c)
	if err != nil {
		if ent.IsNotFound(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Bookmark not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete bookmark"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmark deleted successfully"})
}

func getBaseURL(c *gin.Context) string {
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	return scheme + "://" + c.Request.Host
}
