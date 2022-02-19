# CSE_586_Dstributed_Systems
DS Project

## Usage Instructions

From cmd/terminal

`
docker pull mongo
cd server && docker build -t express-api-image .
cd ../client && docker build -t react-app-image .
cd ..
docker-compose up
`

### From browser client

For list of posts

`
https://localhost:3000/
`

For create post
`
https://localhost:3000/posts/create
`
