
#!/bin/bash
set -e

echo "Starting deploy"

# Building the library
npm run test
npm run build

CURRENTDIR=~code/chess-database-frontend
SERVEDIR=~/serve_content/chessinsights

cd $CURRENTDIR
rm -rf $SERVEDIR
mkdir $SERVEDIR
cp -r $CURRENTDIR/lib $SERVEDIR
cp -r $CURRENTDIR/index_prod.html $SERVEDIR
cp -r $CURRENTDIR/css $SERVEDIR
