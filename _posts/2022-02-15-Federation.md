---
layout: single
title: "Federating Google Cloud Identities with Azure Active Directory"
excerpt: "This article is demonstrating how to map Azure AD identities to Google Cloud Identity."
header:
  teaserlogo: /assets/images/Blog/2022-02-15/identity.png
  teaser: /assets/images/Blog/2022-02-15/identity.png
  image: /assets/images/splash.jpg
  og_image: /assets/images/Blog/2022-02-15/identity.png
  caption:
gallery:
  - image_path: ''
    url: ''
    title: ''
categories:
  - Blog
tags:
  - Azure Active Directory
  - Google Cloud
  - Identity Federation
toc_label: "Table of content"
toc: true
toc_sticky: true
toc_icon: "laptop-code"
classes: wide
---
[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

I have started working a bit on GCP and usually the first challenge you have when doing public cloud is identity, GCP allows you to federate from multiple sources and depending on your environment you got some good options when you have some Microsoft stack like Active Directory. In my case, I wanted to test when the identities are already in Azure AD and you want to leverage the already Enterprise level features that AAD offers to establish a trust with Google Cloud Identity.  This allow us to do the below without much effort.

1. Provision users, groups and group memberships.
   The connector allows you to provision users and groups that are already in Azure AD to provision them in Google Cloud Identity. 
1. Single Sign-On (SSO)
  Google Cloud delegates the authentication to Azure AD by using SAML
1. Conditional Access Policies
1. Multifactor Authentication

{% capture mynote%}
**Note** 
Unfortunately, there is a gotcha as Microsoft currently does not allow for the ability to sync nested groups through Enterprise Applications. Usually, most enterprises do have groups nested in groups and you cannot sync them through the connector. 
{% endcapture %}
{{mynote}}{: .notice--info}

The diagram below depicts the flow process to achieve the provisioning as well as Single Sign-On. I have used one Enterprise Application for both provisioning and Single-Sign-On.
![image-center](/assets\images\Blog\2022-02-15\identity.png){: .align-center}

### Google Requirements
You need a to create an user account in the [GCP Admin Console][gcp_console] which for my PoC it is `ceroprov@johnalfaro.com` and it needs to have `super-admin` permissions. This account will be use to authorize the creation of groups and users in the GCP side.

![image-center](/assets\images\Blog\2022-02-15\prov.png){: .align-center}


### Azure AD requirements
There are few settings to be configured in Azure AD to enable the Enterprise Application to handle both user provisioning and single sign-on. Make sure you had the correct permissions to do so. The following roles from higher to lower permisssions to achieve this task are: `Global Administrator`, `Cloud Application Administrator`, or `Application Administrator`.
![image-center](/assets\images\Blog\2022-02-15\entapp.png){: .align-center}

  1. Create the Google Cloud Connector Enterprise Application. Search for `Google Cloud` and there is a `Google Cloud/G Suite Connector by Microsoft ` The following settings are required from the properties.
     - Set `Enabled for users` to sign-in to `Yes`.
     - Set `User assignment` required to `Yes`.
     - Set `Visible to users` to `No`.
  2. Set the following settings in the `provisioning settings`
     - Set `Provisioning Mode` to `Automatic`.
     - Set `Admin Credentials` then `Authorize`.
       I used the `ceroprov@johnalfaro.com` account to authorize the application. By clicking, allow this will confirm access to the GCP Cloud Identity API.
![image-center](/assets\images\Blog\2022-02-15\aad_to_gcp.png){: .align-center}
  3. Test the connection to make sure you can auth to the API.
![image-center](/assets\images\Blog\2022-02-15\testcon.png){: .align-center}
  
{% capture mynote%}
**Important** Always keep security in mind and use credentials with less privileged access.
{% endcapture %}
{{mynote}}{: .notice--info}

### Configure User/Groups Provisioning
In Azure AD we configure the mapping of users and groups to the GCP Cloud Identity API.

#### User Provisioning
I have used the `UPN` to configure the mapping of users. This is the unique identifier of the user in Azure AD, so cannot go wrong there 🤠. The [GCP documentation][gcp_doco] provides what can be used to configure the mapping.
  1. Under `attribute mapping` select row `surname` and set `Default value if null` to `_`.
  2. Under `attribute mapping` select row `givenName` and set `Default value if null` to `_`.

#### Group Provisioning
I have used the `Name` to configure the mapping of groups. The [GCP documentation][gcp_doco] recommends to edit the `mail` attribute in the `attribute mappings` and change mapping type to `Expression` and set the expression as below. Where I set `johnalfaro.com`, please set your registered domain.

I have also setup the `Sync only assigned users and groups` as I do not want to sync all users and groups which is definitely recommended for any organization.

```ruby
Join("@", NormalizeDiacritics(StripSpaces([displayName])), johnalfaro.com")
```
![image-center](/assets\images\Blog\2022-02-15\mapp.png){: .align-center}
 
#### User and Groups Syncing
Now it's time to test-drive the connector. Make sure you add some relevant users and groups you want to sync to GCP by adding them under `manage` then `user and groups`. After this, you have two options to sync the users and groups.

  1. [Provision on demand][demand]: This is kind of a manual process, you can use it to test, troubleshoot and also validate expressions set in the `attribute mappings`
![image-center](/assets\images\Blog\2022-02-15\provondemand.png){: .align-center}
  2. Automatic Provisioning: This is the recommended option; it will provision the users and groups in the GCP Cloud Identity API. There is an initial provisioning cycle, followed by periodic incremental cycles that runs every 40 min.

#### Monitoring
Luckily we can monitor the provisioning process OOB. The logs provide details about all operations run by the user provisioning service, including provisioning status for individual users and groups.
![image-center](/assets\images\Blog\2022-02-15\logs.png){: .align-center}

### Single Sign-On configuration
I have followed the GCP documentation that was easy to follow to setup SSO. The configuration is as follows.
  1. Edit the `Basic SAML Configuration` with the following settings:
     - Identifier (Entity ID): google.com
     - Reply URL: https://www.google.com/
     - Sign on URL: https://www.google.com/a/johnalfaro/ServiceLogin?continue=https://console.cloud.google.com/, replacing `johnalfaro` with your Domain Name.
  2. Download the `Certificate(base64)` certificate from the `SAML Signing Certificate`
  3. In the `Attributes & Claims` section, I have selected `user.userprincipalname` as the Unique identifier.
  4. In the [GCP Admin Console][gcp_console] login as a Super-admin user and navigate to `Security > Authentication > SSO with third-party IdP` then `Add SSO profile`. Set to `enabled` the `Setup SSO with third party identity provider`.
     - Sign-in page URL: Copy the URL from the `Set up Google Cloud` card, in the Google  Enterprise Application SSO Configuration.
     - Sign-out page URL: https://login.microsoftonline.com/common/wsfederation?wa=wsignout1.0.
     - Change password URL: https://account.activedirectory.windowsazure.com/changepassword.aspx, this will depends if you are using SSPR(Self-service Password Reset).
     - Upload the certificate in the `verification certificate` field.

![image-center](/assets\images\Blog\2022-02-15\sso.png){: .align-center}

### The Test-Drive🦸‍♂️
After setting everything up I have tested the connector by adding some users and groups to get them synced to GCP, as well as, login to the [GCP Console][console], which will redirect me to Azure AD  to sign-in and after successful sign-in I will be redirected to the GCP Console as per below.👨‍💻

![image-center](/assets\images\Blog\2022-02-15\sso_gcp.gif){: .align-center}


### Summary
The Google documentation was easy to follow and the setup was simple in a demo environment. However, I did have some issues with the provisioning part as every now and then it was being quarantined while using the automatic provisioning, I was getting the email notification. However, at an Enterprise level I will definitely prefer to provision users and groups in GCP using the API. This will ensure that the users and groups are synced effectively to GCP. In addition, nested groups will not be an issue as unlike the provisioning feature in Azure AD.

I did have some fun as well writing in markdown and getting [Github Copilot][gh] helping me to write the blog which to my surprise was accurate. I guess I may have less typos this time around.👨‍💻

I do hope this helps someone and that you find it informative,, so please let me know your constructive feedback as it's always important🕵️‍♂️,, That's it for now,,, Hasta la vista🐱‍🏍!!!

**🚴‍♂️ If you enjoyed this blog, you can empower me with some caffeine to continue working in new content 🚴‍♂️.**

[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

[gcp_console]: https://admin.google.com/
[gcp_doco]: https://cloud.google.com/architecture/identity/federating-gcp-with-azure-ad-configuring-provisioning-and-single-sign-on#configure_user_provisioning
[demand]: https://docs.microsoft.com/en-us/azure/active-directory/app-provisioning/provision-on-demand
[console]: https://console.cloud.google.com/
[gh]: https://copilot.github.com/