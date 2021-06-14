data "ibm_resource_group" "mailer_resource_group" {
   name = var.resource_group
}

resource "ibm_function_namespace" "namespace" {
   name                = var.basename
   resource_group_id   = data.ibm_resource_group.mailer_resource_group.id
}

resource "ibm_function_package" "cloudmailer" {
  name = "cloudmailer" 
  namespace = ibm_function_namespace.namespace.name
}

resource "ibm_function_action" "sendEmail" {
  name      = "cloudmailer/sendEmail"
  namespace = ibm_function_namespace.namespace.name

  exec {
    kind = "nodejs:12"
    code = file("../smtp_email.js")
  }
  user_defined_parameters = var.server_config
}