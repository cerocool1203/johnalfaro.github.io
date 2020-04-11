---
title: Ansible
author: David O'Brien
layout: single
featured_topic: true
sidebar_exclude: true
icon: fa-cogs
---
Ansible by Redhat is an open source configuration management tool that works cross-platform from Linux to Windows..

## Previously Published Articles

<ul class="this" style="list-style-type:none">
{% for post in site.posts %}
{% if post.tags contains 'Ansible' %}<li>{{ post.date | date:"%Y-%m-%d" }} <a href="{{ post.url }}">{{ post.title }}</a></li>{% endif %}
{% endfor %}
</ul>