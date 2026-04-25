# Admin Setup

This project uses Firebase Authentication plus Cloud Firestore for the ranking and news admin panel.

Public account signup also uses Firebase Authentication. Passwords are kept by Firebase Auth only; Firestore stores the non-password profile fields needed by the site.

## Firestore schema

### `users/{uid}`

Created when a player signs up.

```json
{
  "uid": "firebase-auth-uid",
  "username": "HeroName",
  "usernameLower": "heroname",
  "email": "player@example.com",
  "phone": "+63 900 000 0000",
  "hasPhone": true,
  "hasSecondaryPassword": false,
  "role": "player",
  "authProvider": "password",
  "emailVerified": false,
  "createdAt": "serverTimestamp()",
  "updatedAt": "serverTimestamp()"
}
```

### `usernames/{usernameLower}`

Created in the same Firestore transaction as `users/{uid}` to reserve unique account names.

```json
{
  "uid": "firebase-auth-uid",
  "username": "HeroName",
  "usernameLower": "heroname",
  "createdAt": "serverTimestamp()"
}
```

### `siteContent/rankings`

```json
{
  "categories": {
    "worldBoss": {
      "label": "世界头目",
      "metricLabel": "战力/积分",
      "entries": [
        {
          "id": "worldBoss-1",
          "position": 1,
          "name": "龙傲天",
          "school": "剑宗",
          "score": 158200
        }
      ]
    }
  },
  "updatedAt": "serverTimestamp()",
  "updatedBy": {
    "uid": "firebase-auth-uid",
    "email": "admin@example.com",
    "displayName": "运营"
  }
}
```

### `siteContent/news`

```json
{
  "items": [
    {
      "id": "news-2026-04-06-v125",
      "category": "公告",
      "title": "《鸿禧墨魂+30》V1.2.5版本更新维护公告",
      "date": "2026-04-06",
      "body": "<p>公告正文 HTML</p>"
    }
  ],
  "updatedAt": "serverTimestamp()",
  "updatedBy": {
    "uid": "firebase-auth-uid",
    "email": "admin@example.com",
    "displayName": "运营"
  }
}
```

### `admins/{uid}`

```json
{
  "active": true,
  "role": "editor",
  "email": "admin@example.com",
  "displayName": "运营",
  "createdAt": "serverTimestamp()"
}
```

## First admin bootstrap

1. Have the client sign in or register through Firebase Auth once.
2. Copy their Firebase Auth UID from `/pages/admin/`.
3. In Firestore, create `admins/{uid}` with:

```json
{
  "active": true,
  "role": "editor",
  "email": "their-email@example.com"
}
```

4. Deploy Firestore rules with `firebase deploy --only firestore`.

After that, the client can sign in at `/pages/admin/` and edit the rankings and 快报内容 directly.
