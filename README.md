#Oroboro - Svg Editor App for Meteor ver.0.1.0

(We have a better version in work. Stay tuned on https://www.youtube.com/channel/UCvttYMVLy72hqUolQqtO91Q/videos )

If you are interested to see a live version and/or a live presentation, let us know. At the moment, we do not have a reliable server due to the alpha nature of this project.

![](http://orobo.go.ro:3500/file/JZXXMo5N38iwgfNAG/0.1)

## Running on your machine

Initial setup:

```bash
git clone git@github.com:oro8oro/oroboro.git
cd oroboro
meteor

# Data is needed to run the current version
mongorestore -h localhost:3001 public/dump
```

## About Orobo.ro

[Oroboro](http://orobo.go.ro:3500) is an alpha live-collaboration SVG editor with cloud support, in Meteor.js.

This is a complex project, combining powerful SVG editing features with creating and maintaining an online database for sharing, showcasing works, live-collaboration on projects and even creating and performing tutorials and presentations.


See our [tutorial](http://orobo.go.ro:3500/md/tutorial) for how to use the editor.

Try our [playground](http://orobo.go.ro:3500/filem/eGfQyh6jCqxeEYmex) or [sign up](http://orobo.go.ro:3500) and start by ![](http://orobo.go.ro:3500/file/menuItemClone/0.04) cloning existing designs and editing them.


## Current Status

Alpha means that it is still in development and bugs could be encountered. On the other hand, this is a good thing because we can still implement features needed by the community and we are actually looking forward to [feedback on this](https://github.com/oro8oro/oroboro/issues)

## Oroboro Editor

Features:

- live collaboration in the editor; you can even see your collaborator's mouse pointer if you want
- live feedback when changing parameters

![](http://orobo.go.ro:3500/file/Caj6Gda3CFZGnvn8v/0.1)
![](http://orobo.go.ro:3500/file/fEv7RE3LdYpQ4Q8TW/0.1)
![](http://orobo.go.ro:3500/file/n6yMHex8KcBPBC9Ts/0.1)
![](http://orobo.go.ro:3500/file/8JyQRohBkBZvzRwEp/0.1)
![](http://orobo.go.ro:3500/file/ngiimZYX6f5FtJdY2/0.1)
![](http://orobo.go.ro:3500/file/7jLp2apKztDxd6Siv/0.1)

 - basic operations and actions, such as editing points, changing geometry, changing appearance (fill, stroke etc.), creating groups, horizontal/vertical mirror, split / join paths, reverse path order, clone, delete
 filem
 [![](http://orobo.go.ro:3500/file/nzumC3jDDPK6jnPTZ/0.1)](http://orobo.go.ro:3500/viewer?url=/file/nzumC3jDDPK6jnPTZ)
 [![](http://orobo.go.ro:3500/file/oPifnc3gKSdxqaipz/0.1)](http://orobo.go.ro:3500/viewer?url=/file/oPifnc3gKSdxqaipz)

 - 3D perspective tool that you can use to easily create shadows

 [![](http://orobo.go.ro:3500/file/2oBer6NfjwHpWjYXm/0.1)](http://orobo.go.ro:3500/viewer?url=/file/2oBer6NfjwHpWjYXm)
 [![](http://orobo.go.ro:3500/file/i5CppdgDDB5LpKn3S/0.1)](http://orobo.go.ro:3500/viewer?url=/file/i5CppdgDDB5LpKn3S)
 [![](http://orobo.go.ro:3500/file/ucTL7f4TFNFP4ZGEA/0.1)](http://orobo.go.ro:3500/viewer?url=/file/ucTL7f4TFNFP4ZGEA)

 - generating paths from mathematical equations, using cartesian or polar coordinates (polar roses, archimedean spirals etc.)

 [![](http://orobo.go.ro:3500/file/gzG3QnbfhFMbBQCzf/0.1)](http://orobo.go.ro:3500/viewer?url=/file/gzG3QnbfhFMbBQCzf)
 [![](http://orobo.go.ro:3500/file/z5CTy2uBPegog5Bnv/0.1)](http://orobo.go.ro:3500/viewer?url=/file/z5CTy2uBPegog5Bnv)
 [![](http://orobo.go.ro:3500/file/nPW3sGvBa57m87d7d/0.1)](http://orobo.go.ro:3500/viewer?url=/file/nPW3sGvBa57m87d7d)

 [![](http://orobo.go.ro:3500/file/h2bNyDpySrwrsG5N2/0.1)](http://orobo.go.ro:3500/viewer?url=/file/h2bNyDpySrwrsG5N2)
 [![](http://orobo.go.ro:3500/file/KBtAqH623Src52i96/0.1)](http://orobo.go.ro:3500/viewer?url=/file/KBtAqH623Src52i96)
 [![](http://orobo.go.ro:3500/file/zrsJTCFpCXKYh8dxE/0.1)](http://orobo.go.ro:3500/viewer?url=/file/zrsJTCFpCXKYh8dxE)

 - generating paths with our symmetry engines (point symmetry, line symmetry) in order to create complex designs such as spirals and kaleidoscopes; live feedback: modifying the original path changes the entire design at the same time with it.

 [![](http://orobo.go.ro:3500/file/2CC2YmbKH9pzL4rb8/0.1)](http://orobo.go.ro:3500/viewer?url=/file/2CC2YmbKH9pzL4rb8)
 [![](http://orobo.go.ro:3500/file/xkYrgQSscp4yoKM9v/0.1)](http://orobo.go.ro:3500/viewer?url=/file/xkYrgQSscp4yoKM9v)
 [![](http://orobo.go.ro:3500/file/iQdYEY4DHG5EJkTLd/0.1)](http://orobo.go.ro:3500/viewer?url=/file/iQdYEY4DHG5EJkTLd)

 - generating paths with our array-like repetitions can help you create tiles and tessellations.

 [![](http://orobo.go.ro:3500/file/ACKSA92hnv8Xm7TdQ/0.1)](http://orobo.go.ro:3500/viewer?url=/file/ACKSA92hnv8Xm7TdQ)
 [![](http://orobo.go.ro:3500/file/5j8hem49B5c8Wmf8w/0.1)](http://orobo.go.ro:3500/viewer?url=/file/5j8hem49B5c8Wmf8w)
 [![](http://orobo.go.ro:3500/file/Li8SBbTjjfmwdhAg8/0.1)](http://orobo.go.ro:3500/viewer?url=/file/Li8SBbTjjfmwdhAg8)
 [![](http://orobo.go.ro:3500/file/MTeMg4fEryLvaSoBX/0.1)](http://orobo.go.ro:3500/viewer?url=/file/MTeMg4fEryLvaSoBX)
 [![](http://orobo.go.ro:3500/file/qDRbePmMAJgGhgzcg/0.1)](http://orobo.go.ro:3500/viewer?url=/file/qDRbePmMAJgGhgzcg)

 - boolean operations on simple paths (union, difference, xor, intersection), with possibility to convert complex paths to a multi-point simple path with our simplify tool.

 - connecting elements from the canvas or creating static labels for them



## Oroboro Filebrowser

[![](http://orobo.go.ro:3500/file/9soqDH7MhEw8rcXBx/0.1)](http://orobo.go.ro:3500/viewer?url=/file/9soqDH7MhEw8rcXBx)
[![](http://orobo.go.ro:3500/file/yds48TWE8TpC39SXQ/0.1)](http://orobo.go.ro:3500/viewer?url=/file/yds48TWE8TpC39SXQ)
[![](http://orobo.go.ro:3500/file/k6oThcBq7HrPE2hEN/0.1)](http://orobo.go.ro:3500/viewer?url=/file/k6oThcBq7HrPE2hEN)
[![](http://orobo.go.ro:3500/file/xNdm3hx4M3WLhGd7x/0.1)](http://orobo.go.ro:3500/viewer?url=/file/xNdm3hx4M3WLhGd7x)

- template folders - add a template only once, to have it as a background in the editor, when creating your beautiful designs.


## Want to help?

Go to [https://github.com/oro8oro/oroboro/issues](https://github.com/oro8oro/oroboro/issues)

You can help by:
 - offering us ideas about Oroboro's usabillity. For example, we would like to use it for educational purposes, as a mathematical formulae browser (among a lot of other things)
 - offering us ideas about other interesting features
 - signaling bugs
 - contributing code

## License: [GPLv3](http://www.gnu.org/copyleft/gpl.html)

(see [gplv3_license.txt](https://raw.githubusercontent.com/oro8oro/oroboro/master/gplv3_license.txt))
