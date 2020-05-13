# BriserLaChaine.org

An app to help people trace and warn people they've recently been in contact with, in relation with the COVID-19 spread.

This is the source code of the app live at [www.BriserLaChaine.org](https://www.BriserLaChaine.org).

## Dev Setup

Although there is a `package.json` file at the root of this repo, this is not a usual node package.
We actually use it entirely in Docker containers to develop or to build a release. That helps us
ensuring all engineers working on the project work on the same environment despite being on
different machines.

To start using or coding this repo, you thus need to install Docker and Docker Compose, and then you
can run:

```sh
docker-compose up -d dev
```

and see the result at `http://localhost:9394`.

We have Hot Reload so you can start modifying the code and see the change happens right away.

## Production Build

If you want to serve the app live, we strongly recommend that you build the package and serve it as
static files. You can do that with a simple command:

```sh
docker-compose build nginx
```

The resulting container image has an Nginx server serving the files. You can also extract those
files from this image and serve it with another server: this is exactly what we do as we use Open
Stack Object Storage on OVH public cloud.
