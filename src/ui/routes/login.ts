export function renderLoginPage(): string {
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Candidlabs Hub Login</title>
    <style>
      body { font-family: sans-serif; margin: 2rem; max-width: 32rem; }
      label { display: block; margin-top: 0.75rem; }
      input, select, button { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
    </style>
  </head>
  <body>
    <h1>Mock Login</h1>
    <p>Phase 1 scaffold only.</p>
    <form method="post" action="/auth/mock-login">
      <label>Email
        <input name="email" type="email" required />
      </label>
      <label>Name
        <input name="name" type="text" />
      </label>
      <label>Role
        <select name="role" required>
          <option value="founder">founder</option>
          <option value="admin">admin</option>
          <option value="sales">sales</option>
          <option value="finance">finance</option>
        </select>
      </label>
      <button type="submit">Sign in</button>
    </form>
  </body>
</html>`;
}
