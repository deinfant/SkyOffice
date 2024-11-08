# Together City account branch

For account and the users' datas.
Save at the Database for Data Governance and Management

## Database: [MariaDB](https://mariadb.com/)

### Installations

### for apt pkg manager


```
    sudo apt update
    sudo apt install mariadb-server mariadb-client
    sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

    systemctl start mariadb.service
    systemctl enable mariadb.service

```

Startup in Nodejs:
    [MariaDB - Getting Started With the Node.js Connector](https://mariadb.com/kb/en/getting-started-with-the-node-js-connector/)

For Knowledges:
    [MariaDB - Knowledge Base](https://mariadb.com/kb/en/)

For Server Docs:
    [MariaDB - MariaDB Server Documentation](https://mariadb.com/kb/en/documentation/)


## Tables:


### Users:
Save the users' datas and users' account

```

# user_id: user's id, primary key and auto increment at creation
# user_account: user's account for log-in, that must not be null
# user_passwd: user's hashed password
# user_google_id: user's token that is linked to Google
# user_display_name: user's name for display
# user_created: account created date and time
# user_updated: account updated time, that auto update when updating the user data

CREATE TABLE `Users` (
    `user_id` int(11) NOT NULL AUTO_INCREMENT,
    `user_account` varchar(255) NOT NULL,
    `user_passwd` varchar(255) NOT NULL,
    `user_google_id` varchar(255) DEFAULT NULL,
    `user_display_name` varchar(20) DEFAULT 'NewUser',
    `user_created` timestamp NULL DEFAULT current_timestamp(),
    `user_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `user_account` (`user_account`),
    UNIQUE KEY `google_user_id` (`user_google_id`)
)

```
