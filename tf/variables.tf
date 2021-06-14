variable "basename" {
  description = "Project name used for package and more"
  default     = "cloudmailer"
}

variable "region" {
  description = "The region to deploy to, e.g., us-south, eu-de, etc."
  default     = "us-south"
}

variable "resource_group" {
  description = "Name of the existing resource group to deploy into."
  default     = "default"
}

variable "ibmcloud_timeout" {
  description = "Timeout for API operations in seconds."
  default     = 900
}

variable "ibmcloud_api_key" {

}

variable "server_config"{
  type= string
  default= <<EOF
    [ 
      {
        "key":"server",
        "value": {
           "host": "smtp.example.com",
           "port" : 465,
           "id": "security@example.com",
           "password": "strong-password"
        }
      }
    ]
EOF
}