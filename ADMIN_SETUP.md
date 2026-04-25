# Admin Setup

This project uses Firebase Authentication plus Cloud Firestore for the ranking admin panel.

## Firestore schema

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

After that, the client can sign in at `/pages/admin/` and edit the rankings directly.
