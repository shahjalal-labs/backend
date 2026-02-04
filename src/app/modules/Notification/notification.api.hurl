# send test notification
POST {{port6011}}/notify/send-test
Content-type: application/json
{
   "receiverId":"694a793d6f65b4f863400d6a",
   "title":"10 Send test notification",
   "body":"This is a test notification from postman",
   "type":"SCHEDULE",
   "notificationChannel": "INAPP",
   "senderId":"696e0f7ac1538597d9cb43f4",
   "metaData":{
  "action": "friend_request",
  "actionId": "12345abcde",
  "messagePreview": "John Doe sent you a friend request",
  "extra": {
    "priority": "high",
    "sound": "ping",
    "deeplink": "myapp://friends/requests"
  }
}

}

# my notifications
#/ isRead=> true, false, all
GET {{port6011}}/notify/my?page=1&limit=20&isRead=all
#Authorization: {{ashsrahim}}
#Authorization: {{ashsrasu}}
Authorization: {{ashRaisa}}

# get single notification and marks as read
GET {{port6011}}/notify/single/6978616ac37761286140fef8
#Authorization: {{ashsrahim}}
#Authorization: {{ashsrasu}}
Authorization: {{ashRaisa}}


# get notification unread count
GET {{port8012}}/notify/unread-count
#Authorization: {{ashsrahim}}
Authorization: {{ashsrasu}}



# mark all as read or unread
PATCH {{port6011}}/notify/mark-all
#Authorization: {{ashsrahim}}
Authorization: {{ashsrasu}}
Content-type: application/json
{
  "isRead":false
}
