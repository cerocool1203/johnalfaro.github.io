---
layout: single
title: "Terraform Cloud - Test Drive Series"
excerpt: "This article provides an idea on how to leverage Terraform Cloud to deploy your Infrastructure as code in Azure"
header:
  teaserlogo:
  teaser: ''
  image: /assets/images/splash.jpg
  caption:
gallery:
  - image_path: ''
    url: ''
    title: ''
categories:
  - Blog
tags:
  - Terraform Cloud
  - Terraform Enterprise
  - Azure
toc: true
toc_label: "Table of content"
toc_sticky: true
toc_icon: "laptop-code"
classes: wide
---

I have been deploying my infrastructure using Terraform Open Source. However, given you can use [Terraform Cloud for free][tfc-feat] you get some features like create and provision infrastructure as well as collaboration which you can do it up to 5 people... which is perfect for what I wanted to achieve. In addition, you get a Terraform Module Registry where you can store and consume modules.

## Account Creation

What do I need to get started

1. Create an Account in  [terraform.io][tfc-account]
2. Create a Terraform Cloud Organization
3. Have your Version Control System provider for your code integration(I will start with this one but in the long run I think I will be using API-driven workflow due to flexibility to trigger from a more comprehensive pipeline deployment where I can have my infra and my application code)

So I decided to open an account and leverage my Version Control System (VCS) account which resides in Github to start exploring a bit deeper. By the time I started the article I already had the integration done but you can follow the [terraform documentation][tfc-git] as you may be using a different VCS provider.

So it kind of looks like this 👇... your own Terraform Cloud (SaaS version)

![image-center](/assets/images/Blog/2020-09-03/tfc.gif){: .align-center}

## Structure

I decided to build a Hub & Spoke scenario where I have three workspaces

- HUB workspace where I have all my platform layer and NVA appliance  = `cerocool-azure-tenant`       👉    Deploys all subscription platform components
  
- Sydney Spoke                                                        = `cerocool-application-syd`    👉    Deploys infra and application(s) into the Virtual Network (vNet)
  
- Melbourne Spoke or Application (just to explorer more)              = `cerocool-application-mel`    👉    Deploys infra and application(s) into the Virtual Network (vNet) 
 
Given that Sydney is the region that usually gets all the love I will deploy most of my infra there as new preview features are released here 

![image-center](/assets/images/Blog/2020-09-03/hub-spoke.jpg){: .align-center}

## Terraform Configuration

To start consuming those workspaces I did create `cerocool-azure-tenant` workspace manually... I guess you always have to start somewhere🤨.. and I have added all the necessary Environment variables from my Azure Service Principal so it can interact with my Azure subscription.

  - My Service Principal will be carrying tasks for deploying the infrastructure but also to do role assignments so given those requirements I assigned `Owner role`.

This changes the way I interact from my configuration as well as my backend
![image-center](/assets/images/Blog/2020-09-03/opens.jpg){: .align-center}

## Terraform Backend

By default, I was using local backend then I moved to State Storage using an Azure Storage Account which provides state locking...but now I have my state file in Terraform Cloud which support remote operations as for my last two methods all operations were run locally, this is not as key on my environment but on an enterprise environment where multiple people are collaborating this can be key for user experience as you will have a few variables like not relaying on your workstation or scary one sharing credentials to interact with Azure❌

so what's a `Backend`,,, it is a term to define how the state is loaded and how the usual operations are executed like apply, destroy, etc.
![image-center](/assets/images/Blog/2020-09-03/backend.jpg){: .align-center}

## Interacting with Terraform Cloud

After we have some of the requirements met to start deploying your infrastructure. You need to somehow communicate with Terraform Cloud. Given my environment I was able to run `terraform login` which is a command released not long ago that allows you obtain automatically an API token. Depending on your environment, you may not be able to use this command so you will generate and save your token on different way. This token gets stored on your local machine and looks like the one below 🤯


```ruby
{
  "credentials": {
    "app.terraform.io": {
      "token": "YOUR OWN TOKEN"
    }
  }
}
```
This token is stored on a file called `credentials.tfrc.json` which on my Windows laptop is stored on `C:\Users\me\AppData\Roaming\terraform.d\credentials.tfrc.json`

{% capture mynote%}
**Just in case** If you have your own hostname then you need to replace it like `terraform login contoso` as by default it is `app.terraform.io`
{% endcapture %}
{{mynote}}{: .notice--info}

After doing all of this we are ready to start planning and applying our Azure infrastructure in this case. Given this is my sandpit environment I did not migrate my state file to Terraform Cloud instead I did start from scratch. 

## Summary
This was just an overview of my journey from Terraform Open Source to Terraform Cloud. I will continue on digging and exploring a bit more into some of the benefits you get by using Terraform Cloud for small teams. I have signed for a free trial to explore some of the cool features like cost estimation, sentinel Policies and of course RBAC. I hope this has been informative and helpful⚔

**🚴‍♂️ If you enjoy this blog, you can empower me with some caffeine to continue working in new content 🚴‍♂️.**

[!["Buy Me A Coffee"](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)


[tfc-feat]: https://www.hashicorp.com/products/terraform/pricing/
[tfc-git]: https://www.terraform.io/docs/cloud/vcs/index.html
[tfc-account]: https://app.terraform.io/signup/account?utm_source=docs_banner