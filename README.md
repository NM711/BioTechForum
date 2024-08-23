
# BioTechForum

BioTechForum is a web technology forum application made with Typescript, NodeJS and Express. 
It was also tested and developed with docker, so its easy to spin up a container and start the service.

It is meant to be fully API based, for which the documentation is to come soon when the project reaches the end of its development. Additionally, it is being developed with the ability to easily integrate the API into many different kinds of front ends.

## Features

***(Note: Many features may or may not have been implemented)***


### REST API
The API was made by following REST Architecture, this ultimately makes it easier to document the functionality and expected arguments per endpoints on a route.

*Documentation Coming Soon....*

### Main CRUD Functionality

As expected from a forum application, there is ways to perform multiple CRUD operations, which once again will be documented in the API later on. But for now I will provide a very high level overview.

There is ways to create communities, comments, add members, promote members, get a customized feed, create posts, etc. As one may also expect there is also w

### Authentication/Authorization

If offers a full session based authenthication and authorization scheme, additionally offers the ability to create *"sudo"* sessions that are meant to be very short lived but can perform "high critical" operations when the user is logged in.

There is 2 main methods a sudo session can be created, the very first is straight forward, the user simply needs to supply a password. The second method is a OTP code will reach the email the user has associated to his account, he will then be prompted to enter the code. *(That is if the user has supplied an email)*

 These kinds of special sessions can serve as an extra layer of security, since if a user gets his cookies snatched and there is no short lived session alongside the snatched cookies, the bad actor would be out of luck. The only way in which he or she could create a sudo session, is by filling in the OTP or password.

As an extra note, it is a given that for a user to change his password or email he needs to re authenticate with a OTP code or password.

### Fully Normalized Database
Not really a feature but can be used to provide more insight into what the application may do, the API is built around a normalized database schema. The database of choice here was MYSQL, and the ER diagram can be seen below:
![TechForum](https://github.com/user-attachments/assets/541a999c-63fe-4c1d-bf8c-bf74b8e4b82d)
