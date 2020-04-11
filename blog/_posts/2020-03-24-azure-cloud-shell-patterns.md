---
title: Azure Cloud Shell - For Real!
date: 2020-03-24T00:01:30
layout: single-github
permalink: /2020/03/azure-cloud-shell
categories:
  - azure
  - governance
  - operations
tags:
  - cloud
  - governance
  - security
  - infrastructure
github_comments_issueid: 15
---

A lot of people have published articles about [Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/overview){:target="_blank"} and how to [master it](https://www.thomasmaurer.ch/2019/01/azure-cloud-shell/){:target="_blank"} was covered by Microsoft's [Thomas Maurer](https://www.twitter.com/thomasmaurer){:target="_blank"} and by many others at conferences and user groups.<br>
However, there is one issue when it comes to Cloud Shell, it is an issue that I see "glossed over" in way too many environments, and that is how to run this _for real_, in an actual environment that is governed by processes.

## Azure Cloud Shell - For Realsies

Cloud Shell allows you to do many nice things, like uploading files to a drive, it remembers your shell history, editing files, creating a PowerShell profile, etc. All of that though requires some sort of storage.<br>
If you are not aware, when you access the Cloud Shell for the first time Azure will ask you to create this storage in the form of an Azure Storage Account and an Azure File Share, obviously this needs to be deployed into a Resource Group.

[![azure cloud shell create](/media/2020/03/cloudshell-create.png)](/media/2020/03/cloudshell-create.png)

This immediately presents the following issues:

- Which Subscription does a user create this storage in?
- Which location will they select?
- What is the Resource Group naming convention?
- What is the Storage Account naming convention?
- What will they name the File Share?
- Does the user even have permissions to do any of this?

Those are a lot of questions for a regular user to find answers to. So what do we do to make sure we do not end up in a total mess of resources all over the place once we have more than one user using the Cloud Shell like in this image here where no convention was followed and resources are spread across multiple locations? (this is with only two users already)

[![cloud shell mess](/media/2020/03/cloudshell-mess.png)](/media/2020/03/cloudshell-mess.png)

## Azure Cloud Shell Deployment

We have a few options here to counter the mess mentioned above.

1. a strong naming convention where everybody knows what to do
   1. great idea, but I do not think I have ever seen this work if not programmatically enforced
   2. does not work in environments where users do not have write access to Azure
2. Azure Policy to enforce convention
   1. better, but might lead to confusion around error messages if 1) is not known to people
   2. does not work in environments where users do not have write access to Azure
3. Automated process to provision a Cloud Shell for users
   1. Did someone say automation? **I am in!**

I recommend my customers to follow this simple automated process which is usually implemented via an Azure DevOps pipeline or even a small Azure Function called from ServiceNow or a LogicApp for example.

1. Pipeline accepts name of user that requires a cloud shell, and it also knows about naming conventions of resources to be created
2. Pipeline creates a Resource Group where the name shows its use but also where one tag is `application:cloudshell` that is deployed into an approved subscription and location
3. Pipeline creates an Azure Storage Account with a name that shows its use to a user but also where one tag is `application:cloudshell` that is deployed into an approved location in Resource Group from step 2)
4. Pipeline creates a File Share for the user based on the user name put in as a parameter to step 1)

Now, when a user logs in to Azure and tries to open up Cloud Shell they just need to select the right resources that have been deployed for them.

[![cloud shell select storage](/media/2020/03/cloudshell-selection.png)](/media/2020/03/cloudshell-selection.png)

> Hot tip: Reuse the Storage Account! Just create new File Shares for new users. There is [**no**](https://docs.microsoft.com/en-us/azure/storage/files/storage-files-scale-targets#azure-storage-account-scale-targets){:target="_blank"} limit on the number of File Shares in a Storage Account.

Until we are able to actually connect a user account to a Cloud Shell without user interaction following this process should keep your environment tidy.<br>
How do you manage all your Cloud Shells?
