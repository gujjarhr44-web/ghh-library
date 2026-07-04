# Replit APK Download Deployment

This project is configured to publish the admin/API server on Replit and serve an Android APK from the download page.

## Put the APK here

Copy the final APK to:

```text
artifacts/admin-dashboard/public/ghh-library.apk
```

The existing download page uses this URL:

```text
/ghh-library.apk
```

After deployment, users can open:

```text
https://<your-replit-app>.replit.app/download
```

## Replit setup

1. Import this repository/folder into Replit.
2. Replit runs the `.replit` deployment build command, which installs dependencies, builds the admin dashboard, and builds the API server.
3. Add this Secret if the API/database routes are needed:

```text
DATABASE_URL=<your-postgres-connection-string>
```

4. Click Publish and choose Autoscale Deployment.

The `.replit` file builds the admin dashboard, builds the API server, and starts one Node server that serves both the dashboard and APK download assets. The current build uses `pnpm install --no-frozen-lockfile` because the workspace config and lockfile are not currently in sync; once the lockfile is regenerated cleanly, you can switch that back to `--frozen-lockfile`.
