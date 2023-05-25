// CAUTION: Changes here will trigger
// CAUTION: a page refresh!
const config = {
  project: {
    launchComponent: 'usm:frame',
  },
  configurator: {
    initData: {
      // Add the init data here for more details
      // see the embedding docu here:
      // https://docs.roomle.com/web/guides/sdk/api/interfaces/configuratorinitdata.html
      // skin: {
      //  'primary-color': 'blue',
      // },

      // keep camera position between reloads
      debug: true,
      // show FPS counter and performance statistics
      stats: true,

      // override the configurator server url
      overrideServerUrl: 'https://www.roomle.com/t/cp',
    },
    /**
     * If your content belongs to a special
     * tenant it is required that you use
     * the correct configurator ID here
     * for more details see the embedding docs
     * https://docs.roomle.com/web/embedding/integration.html
     */
    configuratorId: 'demoConfigurator',
  },
  modifiers: {
    /**
     * Data modifiers. Comment or ucomment the functions insise and refresh browser page to apply the changes. 
     * You can add your own functions there.
     * @param component The component definition as JSON object
     */
    componentDefinition(component) {
      //disableParameterGroups(component);
      applyKeysToLabels(component);
      //applyKeysToLabelsForIDM(component);
      concatenateDebugGeometry(component);
      injectDebugText(component, 50, 50);
    }
  },

};

export default config;


/**
 * removes parameterGroups from the component  definition
 */
const disableParameterGroups = (component) => {
  component.parameterGroups = null;
  if (component.possibleChildren) {
    component.possibleChildren.forEach(pc => {
      pc.group = null;
    });
  }
}

/**
 * Joins the debug geometry to the normal geometry
 */
const concatenateDebugGeometry = (component) => {
  if (component.debugGeometry) {
    if (!component.geometry) { component.geometry = ''; }
    component.geometry = component.geometry.concat(component.debugGeometry);
  }
}

/**
 * Will inject a 2D text in 3D space. Usage example (inside a comment):
 * `#INJECTTEXT true;100;200;300;'text on line 1~text on line 2~' | 'value=' | string(value,0)#ENDINJECTTEXT`
 * @param component 
 * @param textWidth width of the text in mm
 * @param textHeight height of the text in mm
 */
const injectDebugText = (component, textWidth = 50, textHeight = 50) => {
  try {
    if (component.geometry) {
      const geometry = component.geometry.replace(/\r?\n|\r/g, '');
      const foundDebugTextCalls = geometry.match(/(?<=#INJECTTEXT)(.*?)(?=#ENDINJECTTEXT)/g);
      if (foundDebugTextCalls) {
        const internalId = 'DEBUG_TEST_INJECTED_SUBCOMPONENT_';
        let debugTextInjectionNumber = 0;
        foundDebugTextCalls.forEach((debugtext) => {
          const split = debugtext.split(';');
          const data = {
            condition: split[0],
            x: split[1],
            y: split[2],
            z: split[3],
            text: split[4]
          };
          debugTextInjectionNumber++;
          if (!component.subComponents) { component.subComponents = []; }
          component.subComponents.push(
            {
              internalId: internalId + debugTextInjectionNumber,
              componentId: 'isdt:text',
              assignments: {
                text: data.text
              }
            }
            );
          component.geometry = component.geometry.concat(`if (${data.condition}) { SubComponent(${internalId}${debugTextInjectionNumber}); MoveMatrixBy(Vector3f{${data.x}, ${data.y}, ${data.z}}); }`);
        });
      }
    }
  } catch (e) {
    console.log('Inject debug test had a problem');
    console.log(e);
  }
}

/**
 * Takes every parameter key and value and adds it to the beginning of every label
 */
const applyKeysToLabels = (component) => {
  if (component.parameters) {
    component.parameters.forEach(p => {
      if (p.key) {
        for (var k in p.labels) {
          p.labels[k] = p.key + " : " + p.labels[k];
        }
        // Show value object values at beginning of every label
        if (p.valueObjects) {
          p.valueObjects.forEach(vo => {
            if (vo.value && vo.labels) {
              var val = vo.value;
              for (var k in vo.labels) {
                vo.labels[k] = val + " : " + vo.labels[k];
              }
            }
          });
        }
      }
    });
  }
}

/**
 * Variant for IDM content: removes the 'idmFeature' substring from the key.
 */
const applyKeysToLabelsForIDM = (component) => {
  if (component.parameters) {
    component.parameters.forEach(p => {
      if (p.key) {
        const key = p.key.replace('idmFeature', '');
        for (var k in p.labels) {
          p.labels[k] = key + " : " + p.labels[k];
        }
        // Show value object values at beginning of every label
        if (p.valueObjects) {
          p.valueObjects.forEach(vo => {
            if (vo.value && vo.labels) {
              var val = vo.value;
              for (var k in vo.labels) {
                vo.labels[k] = val + " : " + vo.labels[k];
              }
            }
          });
        }
      }
    });
  }
}
