DEEZER test By Bruno Martin (September 14th, 2017)
==============

Sever machine Operating system
--------------
The application has been developed and tested on the following system (LNMP):
   - CentOS 6.9 (64bit)
   - nginx 1.10.2
   - MariaDB Server 10.2.6
   - Server API FPM/FastCGI
   - PHP 7.0.20
   - PHP Modules<br />
bcmath bz2 calendar Core ctype curl date dba dom enchant exif fileinfo filter ftp gd geoip gettext hash iconv igbinary imagick imap interbase intl json json_post ldap libxml maxminddb mbstring mcrypt memcache memcached mongodb msgpack mysqli mysqlnd OAuth openssl pcntl pcre PDFlib PDO PDO_Firebird pdo_mysql pdo_sqlite Phar pinyin posix pspell readline recode Reflection session shmop SimpleXML snmp soap sockets SPL sqlite3 ssh2 standard sysvmsg sysvsem sysvshm tidy tokenizer uploadprogress wddx xdebug xdiff xml xmlreader xmlrpc xmlwriter xsl Zend OPcache zip zlib Xdebug Zend OPcache

Test machine Operating system
--------------
All tests have been done using the following environment.<br />
Even if the code has been thought cross-compatible, it needs more tests for other browsers.
   - Windows 8.1 (64-bit) English
   - Google Chrome Version 60.0.3112.113 (Official Build) (64-bit)
   - FireFox 55.0.3 (64-bit)
   - IE 11.0.9600.18793

Installation
--------------
1. NGINX
   - The file '/_INSTALLATION/nginx_back.conf' contains the nginx configuration needed for SUBJECT #1.
   - The file '/_INSTALLATION/nginx_front.conf' contains the nginx configuration needed for SUBJECT #2.
   - Make sure to adapt those files according to your server, especially pathes.
   - Include the path to these 2 files to your nginx confguration file

2. SSL
They are self-certificated, and use wildcard subdomain *.deezer.bru .
NGIX should point to them:
   - '/_INSTALLATION/ssl.crt'
   - '/_INSTALLATION/ssl.key'

3. SQL
   - Import the file '/_INSTALLATION/demo_deezer.sql', it will create the database and the user 'demo_deezer' used by the PHP application
   - The hostname restriction for the user 'demo_deezer' is '192.168.1.%', modified it according to your connection setting. If any issue, just use the wildcard '%'

4. Database connecton
   - The file '/config/Database.php' contains connection information for the PHP application. If any issue with the user 'demo_deezer', just use the root user.

5. LINUX permission
Launch a LINUX bash command to insure all permissions are setup correctly.<br />
Need to go the the root directory of the application first.
```
# cd /path_to
# sh /_INSTALLATION/permission root
# yum install realpath
# service nginx restart
```

6. DNS
Because the domain is not registered, make sure the host file on the host machine is pointing to the correct IP.<br />
Use your own IP if you installed the server, or use 120.234.18.50 to connect to my server in Shenzhen (China)

Windows => C:\Windows\System32\Hosts
```
120.234.18.50 deezer.bru
120.234.18.50 www.deezer.bru
120.234.18.50 api.deezer.bru
```
Linux => /etc/hosts
```
120.234.18.50 deezer.bru www.deezer.bru api.deezer.bru
```

NOTE
--------------
All code, JS and PHP, are vanilla, without the help of any external library, and were created for this test purpose only.<br />
A MVC structure structure has been designed to keep all the flexibility requested.<br />
Please note that this structure is not ready yet for production.<br />
Since user authentication was not allowed, I just used a API key to secure the communication.<br />
Here are some advantages of this configuration:
   - Can add more models (create a file like '/bundles/api/models/data/toto.php')
   - We can add new attributes (need to modify the table, the setItems method, and few parameters like the $model_visible attribute)
   - We can create new output (need to add more in the file '/libs/Render.php')
   - We code load only the bundles we need for a specific request (only if we want, this can help to have one singular code to maintain for frontend and backend, it can help to save time)
   - Can insert variables inside HTML code
   - Any JS file, CSS file, or picture modified will be automatically refreshed on client side, the application recognize the modification timestamp of each file, no need manual operation from the developer (for example, no need to hardly code '/images/toto.png?v=2')
   - It accepts connection to multiple databases
   - All Errors, JS and PHP, are stored in the directories '/logs/js' and '/logs/php'
   - By using the method '/libs/Watch::php()', we can watch PHP variable, data are stored in the directory '/logs'
<br />
--------------

Sujet 1 : Créer une mini API
==============
Développer en PHP une mini API REST avec output des données en JSON.

Question 1
--------------
1. Mettre en place de quoi pouvoir récupérer les données :<br />
   a. d'un utilisateur en fonction de son identifiant, les données étant son identifiant, son nom, son Email,<br />
   b. d’une chanson en fonction de son identifiant, les données étant son identifiant, son nom, sa durée.

1a
--------------
```
Request URL: https://api.deezer.bru/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{    => Used store data we want to send to the API, the follofing pattern helps to regroup multiple CRUD operation on multiple models, it can help to save bandwidth and server CPU consumption by limiting the calls numbers
        "read":{    => Used to specified CRUD request, it can be "read", "delete", or "set" (which includes to create+update)  
            "user":{    => The model name, it can be "user", "song", or "playlist"
                "1":{    => Any string we want, it's just a key (unused on API) to store multiple objects
                    "id":1,    => The object ID
                    "md5":"8f30ddb8d80ccd2b"    => The object MD5, it's used to secure CRUD operation ("delete & restore" need all the 32 characters, "create & update" need at least the 16 first characters, "read" needs at least the 8 first characters). The API will only give to the client the authorized length of the MD5. For instance, we can see that the user is only 16 characters because we don't allow deletion.
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4" => The API key to secure the communication
}
```

1b
--------------
```
Request URL: https://api.deezer.bru/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "song":{
                "1":{
                    "id":1,
                    "md5":"89bcee85e5d53ee79d70ebd026a7c188"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```

Question 2
--------------
2. Cette API doit aussi être capable de renvoyer les chansons favorites d'un utilisateur. Elle doit permettre de :<br />
   a. récupérer cette liste,<br />
   b. ajouter une chanson dans cette liste,<br />
   c. enlever une chanson de cette liste.<br />

2a
--------------
```
Request URL: https://bruno.api.deezer.bru/playlist/favoritesongs
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "user":{    => We use the user, because we want to grab its favorite playlist information
                "1":{
                    "id":1,
                    "md5":"8f30ddb8d80ccd2b"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```

2b
--------------
NOTE: We split into 2 commands here
- 1st request => Add a song (which is actually the request)
```
Request URL: https://bruno.api.deezer.bru/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "set":{    => We use "set" here because it's an update
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8",
                    "_attach":{    => We attach models together (it juts do nothing if not accepted by the API), it can be "_attach" or "_detach"
                        "0":{    => Any string we want, it's just a key (unused on API) to store multiple objects
                            "0":"song",    => The type of the model we want to attach/detach
                            "1":5,    => The ID of the model we want to attach/detach
                            "2":"e70ec532c5a4da739965216bfb733730"    => The MD5 of the model we want to attach/detach
                        }
                    }
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```
- 2nd request => Grab the updated list
```
Request URL: https://bruno.api.deezer.bru/playlist/favoritesongs
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```

2c
--------------
NOTE: We split into 2 commands here
- 1st request => Add a song (which is actually the request)
```
Request URL: https://bruno.api.deezer.bru/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "set":{
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8",
                    "_detach":{    => We detach models
                        "0":{
                            "0":"song",
                            "1":5,
                            "2":"e70ec532c5a4da739965216bfb733730"
                        }
                    }
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```
- 2nd request => Grab the updated list
```
Request URL: https://bruno.api.deezer.bru/playlist/favoritesongs
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```
<br />
<br />
