# gh-bot
Provides sample github api usage.


# Set up

Install deno - https://deno.land/manual/getting_started/installation
Create an personal access token in github.

Save the access token into a file call creds.ts(in the repo's root), using the format below:
const token = `<place your access token here>`

export { token }


# Run
e.g.
➜ deno run --allow-net=api.github.com create-pr.ts


# Available sample

Incomplete - create-pr.ts : create branch, make change and create a PR


# References

- [Github REST API](https://docs.github.com/en/rest)  
