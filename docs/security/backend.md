---
sidebar: auto
---
# UN Security
The following are requirements that do not or cannot be implemented on the front end.

## Minimum Requirements
| Number       | Description           | Status  |
| ------------- |-------------| -----:|
|3.2|All components (web server(s), database(s) and other back-end server(s), web content management framework, etc.) must be configured according to the relevant vendor/distributor security recommendations and internal practices and policies of the United Nations Secretariat. This statement includes the requirement to change the (default) passwords for all pre-defined accounts, and to use strong passwords that are compliant with Organization’s password policy| <Badge text="N/A" type="success"/>|
|3.4|Databases and other back-end systems may be accessed only indirectly through the web application, and must not be made directly accessible from the Internet. Only the services that are required for the site’s functionality may be made accessible.|<Badge text="N/A" type="success"/>|
|3.5|All connections from web application front-ends to back-end systems must be configured to use minimal privileges. Processes on the servers must run with minimal privileges. When feasible, database service accounts must only be able to read, not update, content. “Write” access must be limited to the database table that is being updated.|<Badge text="N/A" type="success"/>|
|3.6|All user-provided input must be validated before it is passed on to back-end systems or returned to the user. Input must be validated against its type (string, number, date, etc.), range (e.g. positive integers), size (number of characters), valid syntax or set of valid responses (e.g. in drop down lists). Invalid input must either be rejected or “sanitized” by removing or safely encoding any invalid elements from the user- provided input.||
|3.7|Websites that allow uploading of files (images, documents, etc.) must verify the file type and, where possible, be scanned for malicious code.|<Badge text="N/A" type="success"/>|
|3.8|Web applications must not display error or system messages that reveal information about the underlying configuration.|<Badge text="N/A" type="success"/>|
|3.10|Relevant activity on the server and in the application must be monitored and tracked by appropriate logging mechanisms for auditing and accountability purposes, according to the policies of the United Nations Secretariat (see: System Monitoring and Log Management TP). The generated information must be secured against tampering and retained according to applicable retention policies (see: Retention Schedule for ICT Records TP).|<Badge text="N/A" type="success"/>|
|3.11|Access with elevated access rights (e.g. for maintenance or administration purposes) must be protected, e.g. using two-factor authentication or limiting access to specific locations.|<Badge text="N/A" type="success"/>|
|3.13|Passwords must not be stored in “clear text”, but in a form that protects them even in case of a compromise. This implies that the “send my password” functionality is not possible, only the “send a link to change password” is possible.|<Badge text="N/A" type="success"/>|
|3.14|Users shall be able to change their password without intervention of another person.|<Badge text="N/A" type="success"/>|
|3.15|Controls that prevent brute-force attacks against user accounts must be implemented, e.g. by ”locking out” accounts after a pre-defined number of invalid login attempts, or by displaying a CAPTCHA test (or alternative mechanisms) to prevent automated login attempts|<Badge text="N/A" type="success"/>|
|3.17|Authenticated users shall be able to log out. All sessions shall be maintained by the web server in a secure manner. Sessions must be maintained using the controls of the web content management framework. The session id must be generated randomly at logon (i.e. not be guessable), long enough to prevent brute-force attacks (e.g. 20 characters or longer), and not be disclosed in the URL. Sessions must be invalidated when the user logs out, terminated after a pre-defined period of inactivity, and set to automatically expire after a maximum amount of time regardless of activity.|<Badge text="N/A" type="success"/>|

## Level 1

| Number       | Description           | Status  |
| ------------- |-------------| -----:|
|2.9|All accounts are locked (at least temporarily) if a maximum number of authentication
attempts are exceeded. |<Badge text="N/A" type="success"/>|
|4.2|Users can only access files for which they possess specific authorization. |<Badge text="N/A" type="success"/>|
|4.4|Users can only access protected functions for which they possess specific authorization. |<Badge text="N/A" type="success"/>|
|4.11|Direct object references are protected, such that only authorized objects are accessible
to each user. |<Badge text="N/A" type="success"/>|
|5.3|A positive validation pattern is defined and applied to all input. |<Badge text="N/A" type="success"/>|
|5.7|All input validation control failures result in input rejection or sanitation |<Badge text="N/A" type="success"/>|
|6.5|All untrusted data that are output to HTML (including HTML elements, HTML attributes,
javascript blocks, javascript event handlers, CSS blocks, and URI attributes) are properly
escaped for the applicable context. |<Badge text="N/A" type="success"/>|
|8.8|The application does not output error messages containing sensitive data that could
assist an attacker, including session id and personal information. |<Badge text="N/A" type="success"/>|
|||<Badge text="N/A" type="success"/>|
