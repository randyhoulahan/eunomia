---
sidebar: auto
---
# UN Security
The following requirements must be implemented.  Missing level min requirements and level 1 requirements are for the backend.

## Minimum Requirements

| Number       | Description           | Status  |
| ------------- |-------------| -----:|
| 3.1     | All websites must have an assigned and accountable owner, and be registered with the Office of Information and Communications Technology. At the time of registration the responsible department or office must indicate the level of compliance, and in the case of partial compliance include a plan describing the steps and time frame required to achieve compliance with this instruction.| |
|3.3|All applicable security updates (“patches”) must be assessed within 30 days and acted upon accordingly.|<Badge text="Complete" type="success"/> [![Dependency Status](https://david-dm.org/scbd/eunomia.cbd.int.svg)](https://david-dm.org/scbd/eunomia.cbd.int)|
|3.6|All user-provided input must be validated before it is passed on to back-end systems or returned to the user. Input must be validated against its type (string, number, date, etc.), range (e.g. positive integers), size (number of characters), valid syntax or set of valid responses (e.g. in drop down lists). Invalid input must either be rejected or “sanitized” by removing or safely encoding any invalid elements from the user- provided input.||
|3.8|Web applications must not display error or system messages that reveal information about the underlying configuration.|<Badge text="incomplete" type="error"/>|
|3.9|Information that is not necessary for the functioning of the web server must be removed or moved to a more secure location. Components (widgets, plugins, add-ons, etc.) that are not necessary for the functioning of the web server must be disabled or uninstalled. Any component that is essential for the functioning of the website must be tested for vulnerabilities, approved and regularly maintained and updated.|<Badge text="Complete" type="success"/>|
|3.12|All sites must use the “secure hypertext transfer protocol” (HTTPS) to ensure that user credentials and other potentially confidential content cannot be intercepted during transmission. HTTPS uses secure socket layer certificates to verify the authenticity of a website and encrypt all communications between the user and the website. Certificates must be (a) issued by a vendor that is automatically recognized as “trusted” by major browsers, (b) replaced before their expiration date, and (c) utilize secure cryptographic ciphers and keys.[2]|<Badge text="complete" type="success"/>|
|3.16|Users shall only be able to access content for which they possess specific authorization.|<Badge text="complete" type="success"/>|

## Level 1

| Number       | Description           | Status  |
| ------------- |-------------| -----:|
|1.1|Identify all application components (either individual or groups of source files, libraries, and/or executables) present in the application.|<Badge text="incomplete" type="error"/>|
|2.1|All pages and resources require authentication except those specifically intended to be public.  List required |<Badge text="incomplete" type="error"/>|
|3.7|The session id is never disclosed other than in cookie headers, particularly in URLs or logs; the application does not support URL rewriting of session cookies. |<Badge text="incomplete" type="error"/>|
|3.8|All authenticated pages have logout links. |<Badge text="incomplete" type="error"/>|
|4.1|Users can only access URLs for which they possess specific authorization.  |<Badge text="incomplete" type="error"/>|
|4.3|Directory browsing is disabled unless deliberately desired. |<Badge text="incomplete" type="error"/>|
|5.9|The environment is not susceptible to buffer overflows, or security controls prevent buffer overflows. |<Badge text="incomplete" type="error"/>|
|9.3|All forms containing sensitive information have disabled client side caching, including autocomplete features. |<Badge text="incomplete" type="error"/>|
|11.4|Every HTTP response contains a content type header specifying a safe character set (e.g., UTF-8). |<Badge text="incomplete" type="error"/>|
|11.6|The application accepts only a defined set of HTTP request methods, such as GET and POST. |<Badge text="incomplete" type="error"/>|
