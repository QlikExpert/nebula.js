import nucleus from '@nebula.js/nucleus';

import { openApp, params, info as serverInfo } from './connect';

function renderWithEngine() {
  if (!params.app) {
    location.href = location.origin; //eslint-disable-line
  }

  serverInfo.then(info =>
    openApp(params.app).then(app => {
      let obj;
      let objType;

      const nebbie = nucleus.configured({
        themes: info.themes
          ? info.themes.map(t => ({
              key: t,
              load: () => fetch(`/theme/${t}`).then(response => response.json()),
            }))
          : undefined,
        theme: params.theme,
        types: [
          {
            name: info.supernova.name,
          },
        ],
      })(app, {
        load: (type, config) => {
          objType = type.name;
          return config.Promise.resolve(window[objType]);
        },
      });

      const create = () => {
        obj = nebbie.create(
          {
            type: info.supernova.name,
            fields: params.cols || [],
          },
          {
            element: document.querySelector('#chart-container'),
            context: {
              permissions: params.permissions || [],
            },
          }
        );
      };

      const get = () => {
        obj = nebbie.get(
          {
            id: params.object,
          },
          {
            element: document.querySelector('#chart-container'),
            context: {
              permissions: params.permissions || [],
            },
          }
        );
      };

      const render = () => {
        if (params.object) {
          get();
        } else {
          create();
        }
      };

      if (window[info.supernova.name]) {
        render();
      }

      window.hotReload(() => {
        render();
        nebbie.types.clearFromCache(objType);
        obj.then(viz => {
          viz.close();
          render();
        });
      });
    })
  );
}

function renderSnapshot() {
  document.querySelector('#chart-container').classList.toggle('full', true);
  fetch(`/snapshot/${params.snapshot}`)
    .then(response => response.json())
    .then(snapshot => {
      serverInfo.then(info => {
        const layout = {
          ...snapshot.layout,
          visualization: info.supernova.name,
        };

        const objectModel = {
          getLayout() {
            return Promise.resolve(layout);
          },
          on() {},
          once() {},
        };

        const app = {
          getObject(id) {
            if (id === layout.qInfo.qId) {
              return Promise.resolve(objectModel);
            }
            return Promise.reject();
          },
        };

        const nebbie = nucleus.configured({
          themes: info.themes
            ? info.themes.map(t => ({
                key: t,
                load: () => fetch(`/theme/${t}`).then(response => response.json()),
              }))
            : undefined,
          theme: snapshot.meta.theme,
          types: [
            {
              name: info.supernova.name,
              load() {
                return Promise.resolve(window[info.supernova.name]);
              },
            },
          ],
        })(app);

        const render = () => {
          nebbie.get(
            {
              id: layout.qInfo.qId,
            },
            {
              element: document.querySelector('#chart-container'),
              context: {
                permissions: ['passive'],
              },
              options: {
                onInitialRender() {
                  document.querySelector('.nebulajs-sn').setAttribute('data-rendered', '1');
                },
              },
            }
          );
        };

        if (window[info.supernova.name]) {
          render();
        }

        window.hotReload(() => render());
      });
    });
}

if (params.snapshot) {
  renderSnapshot();
} else {
  renderWithEngine();
}
