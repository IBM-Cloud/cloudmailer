# Send emails using IBM Cloud Functions
Use a simple [IBM Cloud Functions](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-getting-started) action to send out emails via SMTP. Pass in the SMTP server configuration and the email using JSON objects. 
For ease of use, bind the server configuration to the action and only pass in the email to send.

The following screenshot shows an email based on [this sample properties](email.blog.json).

![sample email](images/20210609_Sample_Email.png)

See the blog post [A Serverless Function for Sending Emails on IBM Cloud](https://www.ibm.com/cloud/blog/a-serverless-function-for-sending-emails-on-ibm-cloud) for some background and more links.

## Deploy

### Using the IBM Cloud CLI
Use the [IBM Cloud CLI](https://cloud.ibm.com/docs/cli?topic=cli-getting-started) and the [Cloud Functions plugin](https://cloud.ibm.com/docs/cli?topic=cloud-functions-cli-plugin-functions-cli) to deploy the action. Log in to IBM Cloud, [set the namespace](https://cloud.ibm.com/docs/cli?topic=cloud-functions-cli-plugin-functions-cli#cli_namespace_target) and then run:

```sh
ibmcloud fn deploy -m Cloudmailer.yaml
```

Copy over [smtp_config.sample.json](smtp_config.sample.json) to, e.g., **smtp_config.sendgrid.json**. Then adapt the file (see [SMTP server configuration](#smtp-server-configuration)) and use it to set the SMTP configuration as default:

```sh
ibmcloud fn action update cloudmailer/sendEmail   -P smtp_config.sendgrid.json
```

Be aware that typically the port 25 is blocked. Many email providers are using ports like 465 or 587.

Instead of using the IBM Cloud CLI, you can also go to the [IBM Cloud Functions portal](https://cloud.ibm.com/functions/) and create the action there. Use the source from [smtp_email.js](smtp_email.js) for the action.

### Using Terraform

Go into the [tf](tf) directory. You may want to adapt the [provider configuration file](tf/provider.tf) to match your overall environment. Either change [tf/variables.tf](tf/variables.tf) or better override some values in a separate **terraform.tfvars** file. There, you may want to set the IBM Cloud API key to use and change the SMTP server configuration. Set the variable **server_config** similar to shown in the file **variables.tf**, e.g., for SendGrid:

```
server_config= <<EOF
   [ 
      {
        "key":"server",
        "value": {
            "host": "smtp.sendgrid.net",
            "port" : 465,
            "id": "apikey",
            "password": "your-api-key"
        }
      }
    ]

EOF

```

Then, initialize Terraform the usual way with `terraform init`, check that everything will be applied ok by `terraform plan`. Finally, to deploy, run:
```sh
terraform apply
```

It will create a new IAM namespace in IBM Cloud Functions and the action **sendEmail** in the package **cloudmailer**.

To expose the action as secured web action, see the comments in [tf/variables.tf](tf/variables.tf). See the section on [exposing the sendMail action as web action](#expose-the-sendmail-action-as-web-action) below for further details.


## Send emails

To send an email, invoke the action and pass in the JSON object with the email properties. Use [email.sample.json](email.sample.json) and copy it over to a new file, e.g., [email.blog.json](email.blog.json). Edit it to your needs like shown. The email can include plain text in the **text** property, an HTML version in the **html** property or both.


### Send emails using the CLI

Once you or your app have composed an email object, send the email by [invoking the action](https://cloud.ibm.com/docs/openwhisk?topic=cloud-functions-cli-plugin-functions-cli#cli_action_invoke) using the IBM Cloud CLI:

```sh
ibmcloud fn action invoke cloudmailer/sendEmail -r  -P email.json 
```

To send out an email using another SMTP server configuration, you can pass in both the server config and the email properties:
```sh
ibmcloud fn action invoke cloudmailer/sendEmail -r  -P email.json -P smtp_config.myserver.json
```

### Send emails using the API

You can [invoke the sendMail action via API](https://cloud.ibm.com/apidocs/functions#invokeaction). For testing, use the tool **curl**. See the documentation for sample code in some programming languages. Calling an API function requires a valid IBM Cloud IAM access token. In the following example, we first obtain the token and assign its value to an environment variable. Thereafter, we use the token for a curl to send a POST request to invoke the action. The email properties are passed in from a file.

```
export TOKEN=$(ibmcloud iam oauth-tokens --output json | jq -r .iam_token)

curl -X POST --url 'https://us-south.functions.cloud.ibm.com/api/v1/namespaces/04a49bd4-xxxx-xxxx-xxxx-07be0c9b732b/actions/cloudmailer/sendEmail?blocking=true&result=true' -H 'Accept: application/json' -H "Authorization: $TOKEN"  -H 'content-type: application/json' -d @email.json
```
### Expose the sendMail action as web action

Another option is to turn the action into a web action. See the [IBM Cloud Functions documentation on web actions](https://cloud.ibm.com/docs/openwhisk?topic=openwhisk-actions_web) for details. You should secure the web action with one of the offered methods, so that only authorized users can send emails.

Once deployed, you can test the REST API using **curl**. A call would look like this with the email read from a file again:

```sh
curl -X POST https://us-south.functions.appdomain.cloud/api/v1/web/d1ee1c70-xxxx-yyyy-zzzz5-000a41115d3e/cloudmailer/sendEmail.json -H  "X-Require-Whisk-Auth: your-web-secret"  -H "Content-Type: application/json" --data @email_to_send.json
```


## SMTP server configuration
Some notes on common scenarios.

### Use with your custom domain and SMTP server

SMTP / email setup differs depending on your provider. If your provider allows API keys instead of username / password, go with API keys. You may also create a dedicated email account to send out emails. The typical structure for your smtp_config.json looks like this:

```
{
    "server": {
        "host": "smtp.example.com",
        "port" : 465,
        "id": "yourname@example.com",
        "password": "your-password"
    }
}
```


### Use with SendGrid

[IBM Cloud integrates with SendGrid for email delivery](https://cloud.ibm.com/catalog/infrastructure/email-delivery). You can sign up for SendGrid, then use its [SMTP service](https://sendgrid.com/docs/for-developers/sending-email/getting-started-smtp/) with the action from this repository. See the SendGrid documentation or the [IBM Cloud Email Delivery](https://cloud.ibm.com/docs/email-delivery?topic=email-delivery-about-email-delivery) documentation for details.

To send emails, create an API key with at least **Mail Send** privileges. The SMTP configuration, e.g., **smtp_config.sendgrid.json** would then look similar to this:
```
{
    "server": {
        "host": "smtp.sendgrid.net",
        "port" : 465,
        "id": "apikey",
        "password": "your-api-key"
    }
}
```
