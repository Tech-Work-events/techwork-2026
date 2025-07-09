variable "project_id" {
  description = "The Firebase project ID"
  type        = string
}

variable "year" {
  description = "The year for the event"
  type        = string
}

variable "event_name" {
  description = "The name of the event"
  type        = string
}

variable "domain_name" {
  description = "The domain name for the website"
  type        = string
}

variable "firestore_location" {
  description = "The location for Firestore database"
  type        = string
}

variable "storage_location" {
  description = "The location for Firebase Storage"
  type        = string
}

variable "hosting_redirects" {
  description = "List of hosting redirects"
  type = list(object({
    source      = string
    destination = string
    type        = number
  }))
  default = []
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "enable_hosting" {
  description = "Enable Firebase Hosting"
  type        = bool
  default     = true
}

variable "enable_firestore" {
  description = "Enable Firestore database"
  type        = bool
  default     = true
}

variable "enable_storage" {
  description = "Enable Firebase Storage"
  type        = bool
  default     = true
}

variable "enable_auth" {
  description = "Enable Firebase Authentication"
  type        = bool
  default     = true
}

variable "enable_analytics" {
  description = "Enable Google Analytics for Firebase"
  type        = bool
  default     = true
}
