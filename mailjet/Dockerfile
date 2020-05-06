FROM python:3.8 as base

RUN pip install flask requests uwsgi

WORKDIR /usr/app/
EXPOSE 80

CMD ["uwsgi", "--protocol=http", "--socket", "0.0.0.0:80", "--enable-threads", "-w", "mailjet:app"]


FROM base as proxy

COPY mailjet.py /usr/app/

# Label the image with the git commit.
ARG GIT_SHA1=non-git
LABEL org.bayesimpact.git=$GIT_SHA1

FROM base as test

RUN pip install mypy nose nose-watch pylint pylint-doc-spacing pylint-import-modules pylint-quotes requests_mock
RUN pip install pycodestyle

COPY .pylintrc .pycodestyle *.py /usr/app/

ARG SKIP_TEST=
RUN test -n "$SKIP_TEST" && echo "Skipping Type Checks" || mypy . --strict --ignore-missing-imports
RUN test -n "$SKIP_TEST" && echo "Skipping Style Checks" || find -name "*.py" | xargs pycodestyle --config=".pycodestyle"
RUN test -n "$SKIP_TEST" && echo "Skipping Lint Checks" || find -name "*.py" | xargs pylint
RUN test -n "$SKIP_TEST" && echo "Skipping Tests" || nosetests
CMD ["nosetests"]
