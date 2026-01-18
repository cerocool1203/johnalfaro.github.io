---
layout: single
title: "Federating Google Cloud Identities with Azure Active Directory"
excerpt: "This article demonstrates how to map Azure AD identities to Google Cloud Identity."
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
toc_label: "Table of Content"
toc: true
toc_sticky: true
toc_icon: "laptop-code"
classes: wide
---

[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

---

I recently started working with GCP, and as with most public cloud platforms, the first challenge is identity management. GCP allows federation from multiple sources, and if you have a Microsoft stack like Active Directory, you have some great options. In my case, I wanted to test scenarios where identities already exist in Azure AD and leverage its enterprise-level features to establish trust with Google Cloud Identity. This allows us to do the following with minimal effort:

1. **Provision users, groups, and group memberships:**  
   The connector allows you to provision users and groups that are already in Azure AD to Google Cloud Identity.
2. **Single Sign-On (SSO):**  
   Google Cloud delegates authentication to Azure AD using SAML.
3. **Conditional Access Policies**
4. **Multifactor Authentication**

> **Note:**  
> Unfortunately, there is a limitation: Microsoft currently does not allow syncing nested groups through Enterprise Applications. Most enterprises use nested groups, but you cannot sync them through the connector.
{: .notice--info}

---

The diagram below depicts the flow process for provisioning and Single Sign-On. I used one Enterprise Application for both provisioning and SSO.

![Google Cloud Identity Federation Flow](/assets/images/Blog/2022-02-15/identity.png){: .align-center}

---

### Google Requirements

You need to create a user account in the [GCP Admin Console][gcp_console]. For my PoC, it is `ceroprov@johnalfaro.com`, and it needs `super-admin` permissions. This account will authorize the creation of groups and users on the GCP side.

![GCP Admin Console](/assets/images/Blog/2022-02-15/prov.png){: .align-center}

---

### Azure AD Requirements

There are a few settings to configure in Azure AD to enable the Enterprise Application for both user provisioning and SSO. Ensure you have the correct permissions. The following roles (from highest to lowest) can perform these tasks: `Global Administrator`, `Cloud Application Administrator`, or `Application Administrator`.

![Azure Enterprise Application](/assets/images/Blog/2022-02-15/entapp.png){: .align-center}

1. **Create the Google Cloud Connector Enterprise Application:**  
   Search for `Google Cloud` and select `Google Cloud/G Suite Connector by Microsoft`. Configure the following:
   - Set `Enabled for users to sign-in` to `Yes`.
   - Set `User assignment required` to `Yes`.
   - Set `Visible to users` to `No`.
2. **Provisioning Settings:**
   - Set `Provisioning Mode` to `Automatic`.
   - Set `Admin Credentials` and then `Authorize`.  
     Use the `ceroprov@johnalfaro.com` account to authorize the application. Allowing this confirms access to the GCP Cloud Identity API.
   ![Provisioning Settings](/assets/images/Blog/2022-02-15/aad_to_gcp.png){: .align-center}
3. **Test the connection** to ensure you can authenticate to the API.
   ![Test Connection](/assets/images/Blog/2022-02-15/testcon.png){: .align-center}

> **Important:**  
> Always keep security in mind and use credentials with the least privileged access.
{: .notice--info}

---

### Configure User/Group Provisioning

In Azure AD, configure the mapping of users and groups to the GCP Cloud Identity API.

#### User Provisioning

I used the `UPN` to configure user mapping. This is the unique identifier in Azure AD. The [GCP documentation][gcp_doco] provides details on mapping.

1. Under `attribute mapping`, select the row `surname` and set `Default value if null` to `_`.
2. Under `attribute mapping`, select the row `givenName` and set `Default value if null` to `_`.

#### Group Provisioning

I used the `Name` to configure group mapping. The [GCP documentation][gcp_doco] recommends editing the `mail` attribute in `attribute mappings`, changing the mapping type to `Expression`, and setting the expression as below. Replace `johnalfaro.com` with your registered domain.

I also set `Sync only assigned users and groups` to avoid syncing all users and groups, which is recommended for any organization.

```ruby
Join("@", NormalizeDiacritics(StripSpaces([displayName])), "johnalfaro.com")
```

![Group Mapping](/assets/images/Blog/2022-02-15/mapp.png){: .align-center}

---

#### User and Group Syncing

Now it's time to test the connector. Add relevant users and groups you want to sync to GCP under `Manage > Users and Groups`. You have two options to sync:

1. **[Provision on demand][demand]:**  
   This manual process is useful for testing, troubleshooting, and validating attribute mapping expressions.
   ![Provision on Demand](/assets/images/Blog/2022-02-15/provondemand.png){: .align-center}
2. **Automatic Provisioning:**  
   This is the recommended option. It provisions users and groups in the GCP Cloud Identity API. There is an initial provisioning cycle, followed by incremental cycles every 40 minutes.

---

#### Monitoring

You can monitor the provisioning process out-of-the-box. The logs provide details about all operations run by the user provisioning service, including provisioning status for individual users and groups.

![Provisioning Logs](/assets/images/Blog/2022-02-15/logs.png){: .align-center}

---

### Single Sign-On Configuration

I followed the GCP documentation to set up SSO. The configuration is as follows:

1. Edit the `Basic SAML Configuration` with:
   - Identifier (Entity ID): `google.com`
   - Reply URL: `https://www.google.com/`
   - Sign on URL: `https://www.google.com/a/johnalfaro/ServiceLogin?continue=https://console.cloud.google.com/` (replace `johnalfaro` with your domain name)
2. Download the `Certificate (Base64)` from the `SAML Signing Certificate`.
3. In `Attributes & Claims`, select `user.userprincipalname` as the Unique identifier.
4. In the [GCP Admin Console][gcp_console], log in as a Super-admin and navigate to `Security > Authentication > SSO with third-party IdP` then `Add SSO profile`. Enable `Setup SSO with third party identity provider` and configure:
   - Sign-in page URL: Copy from the `Set up Google Cloud` card in the Google Enterprise Application SSO Configuration.
   - Sign-out page URL: `https://login.microsoftonline.com/common/wsfederation?wa=wsignout1.0`
   - Change password URL: `https://account.activedirectory.windowsazure.com/changepassword.aspx` (depends on SSPR usage)
   - Upload the certificate in the `verification certificate` field.

![SSO Configuration](/assets/images/Blog/2022-02-15/sso.png){: .align-center}

---

### The Test-Drive 🦸‍♂️

After setup, I tested the connector by adding users and groups to sync to GCP and logging in to the [GCP Console][console]. This redirected me to Azure AD for sign-in, and after successful authentication, I was redirected to the GCP Console.

![SSO Test](/assets/images/Blog/2022-02-15/sso_gcp.gif){: .align-center}

---

### Summary

The Google documentation was easy to follow, and the setup was straightforward in a demo environment. I did encounter some issues with provisioning, such as occasional quarantining during automatic provisioning (with email notifications). At the enterprise level, I would prefer to provision users and groups in GCP using the API to ensure effective syncing, especially since nested groups are not supported by Azure AD provisioning.

I also enjoyed writing this in markdown and using [GitHub Copilot][gh] to help draft the blog, which reduced typos. 👨‍💻

I hope this helps someone and that you find it informative. Please let me know your constructive feedback, as it's always important. 🕵️‍♂️ That's it for now—Hasta la vista! 🐱‍🏍

**🚴‍♂️ If you enjoyed this blog, you can empower me with some caffeine to continue working on new content. 🚴‍♂️**

[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)

[gcp_console]: https://admin.google.com/
[gcp_doco]: https://cloud.google.com/architecture/identity/federating-gcp-with-azure-ad-configuring-provisioning-and-single-sign-on#configure_user_provisioning
[demand]: https://docs.microsoft.com/en-us/azure/active-directory/app-provisioning/provision-on-demand
[console]: https://console.cloud.google.com/
[gh]: https://copilot.github.com/