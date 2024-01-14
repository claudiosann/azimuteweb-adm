<template>
  <div>
      <q-table :id="uuid"
               :rows="getFilteredValuesData"
               :columns="columns"
               row-key="name" :class="classes" :visible-columns="visible_columns" :pagination="pagination"
               :separator="separator" :dense="dense" :dark="dark" :flat="flat" :bordered="bordered"
               :square="square" :selection="selection_prop" :selected.sync="selected_prop" :filter="filter"
      >

       <template v-slot:top="props">
        <slot name="top" v-bind:props="props">
            </slot>
       </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width v-if="selection_prop!='none'">
              <q-checkbox
                      v-if="props.multipleSelect"
                      v-model="props.selected"
                      indeterminate-value="some"
              />
            </q-th>
              <!-- {{props}} -->
            <q-th
                    :props="props"
                    @hover.native.stop
                    v-for="col in props.cols"
                    :key="col.name"
                    auto-width
            >
              <div class="row inline">
                <div class="column">
                  <span>{{ col.label }}</span>
                </div>
                <div class="column">
                  <q-btn flat dense size="sm" icon="fa fa-filter" class="q-ml-xs" @click.stop v-if="header_filter">
                    <q-icon name="fas fa-asterisk" color="red" style="font-size: 7px;"
                            v-if="column_options_selected[col.field].length>0"></q-icon>
                    <q-menu>
                      <q-space/>

                      <q-btn dense class="float-right q-ma-sm bg-red text-white" round size="sm" v-close-popup flat
                             icon="close"/>

                      <div class="q-pa-sm q-mt-md">
                        <q-select map-options multiple emit-value filled v-model="column_options_selected[col.field]"
                                  :options="column_options[col.field]" style="width: 150px !important;"/>
                      </div>
                      <q-btn color="primary" class="float-right  q-mr-sm q-mb-sm text-capitalize" size="sm"
                             v-close-popup @click="column_options_selected[col.field]=[]" label="Clear"/>
                    </q-menu>
                  </q-btn>
                </div>

              </div>
            </q-th>
          </q-tr>
          <q-tr :props="props" class="ignore-elements" v-if="columns_filter">

            <q-th auto-width v-if="selection_prop!='none'">

            </q-th>
            <q-th :key="col.name" v-for="col in props.cols" style="padding: 0px 0px 0px 0px;">
              <q-input v-if="!col.hasOwnProperty('filter_type') || col.filter_type=='text'" dense class="q-pl-xs q-pr-xs" outlined  v-model="filter_data[col.field]">
                <template v-if="filter_data[col.field]" v-slot:append>
                  <q-icon name="cancel" @click.stop="filter_data[col.field] = ''" class="cursor-pointer"/>
                </template>
              </q-input>

              <q-select class="q-pl-xs q-pr-xs" v-if="col.hasOwnProperty('filter_type') && col.filter_type=='select'" map-options
                        emit-value outlined v-model="column_options_selected[col.field]"
                        :options="col.column_options" dense>
                <template v-slot:append>
                  <q-icon v-if="column_options_selected[col.field].length>0" name="close" @click.stop="column_options_selected[col.field]=[]" class="cursor-pointer"/>
                </template>
              </q-select>
            </q-th>
          </q-tr>

        </template>

        <template v-slot:top-right="props" v-if="excel_download || csv_download || fullscreen || global_search">

           <q-input filled v-if="global_search" borderless dense debounce="300" v-model="filter" class="q-mr-md" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>

          <q-btn
                  class="bg-grey-2 q-mr-sm" icon="fas fa-file-excel"
                  no-caps v-if="excel_download"
                  @click="exportTable('xlsx')"
          />

          <q-btn
                  class="bg-primary text-white " icon="fas fa-file-csv"
                  no-caps v-if="csv_download"
                  @click="exportTable('csv')"
          />

          <q-btn v-if="fullscreen"
              flat
              round
              class="q-ml-sm"
              dense
              :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="props.toggleFullscreen"

            >
              <q-tooltip
                :readonly="$q.platform.is.mobile"
                v-close-popup
              >{{props.inFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}}</q-tooltip>
            </q-btn>

        </template>

        <template v-slot:body="props">
          <q-tr :props="props" v-if="!hasDefaultSlot">

            <q-td auto-width v-if="selection_prop!='none'">
              <q-checkbox color="primary" v-model="props.selected"/>
            </q-td>
            <q-td
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
            >
              {{ props.row[col.field] }}
            </q-td>
          </q-tr>
          <slot name="body" v-bind="props" v-if="hasDefaultSlot">
          </slot>
        </template>
      </q-table>
  </div>
</template>

<script>
import {
  uid
  , exportFile
} from 'quasar';

function wrapCsvValue (val, formatFn) {
  // eslint-disable-next-line no-void
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val;
  // eslint-disable-next-line no-void
  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted);
  formatted = formatted.split('"').join('""');
  /**
         * Excel accepts \n and \r in strings, but some other CSV parsers do not
         * Uncomment the next two lines to escape new lines
         */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')
  return `"${formatted}"`;
}
export default {
  name: 'Grid',
  props: ['data', 'columns', 'file_name', 'csv_download', 'excel_download', 'columns_filter', 'header_filter', 'draggable', 'classes', 'separator', 'dense', 'dark', 'flat', 'bordered', 'square', 'selection', 'selected', 'fullscreen', 'global_search', 'visible_columns', 'pagination'],
  // props: {
  //   data: {
  //     type: [Array, Object],
  //     default: null
  //   },
  //   // column definition
  //   columns: {
  //     type: [Array, Object],
  //     default: () => []
  //   },
  //   // column definition
  //   file_name: {
  //     type: String,
  //     default: ''
  //   },
  //   csv_download: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   excel_download: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   columns_filter: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   header_filter: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   draggable: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   dense: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   dark: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   flat: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   bordered: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   square: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   fullscreen: {
  //     type: Boolean,
  //     default: () => false
  //   },
  //   classes: {
  //     type: String,
  //     default: ''
  //   },
  //   separator: {
  //     type: String,
  //     default: 'horizontal'
  //   },
  //   global_search: {
  //     type: String,
  //     default: 'horizontal'
  //   },
  //   pagination: {
  //     type: [Object],
  //     default: () => {}
  //   }
  // },
  data () {
    return {
      filter_data: {},
      uuid: '',
      column_options: {},
      column_options_selected: {},
      filter_flags: {},
      selection_prop: '',
      name: '',
      selected_prop: [],
      filter: ''
    };
  },
  computed: {
    getFilteredData () {
      const self = this;
      // eslint-disable-next-line camelcase
      const table_columns = this.columns.map(function (item) {
        return item.field;
      });
      // eslint-disable-next-line camelcase
      const table_Data = this.data.filter(function (item) {
        let i = '';
        for (i = 0; i < table_columns.length; i++) {
          if (self.filter_data[table_columns[i]] === '') { continue; }
          try {
            const valorColuna = table_columns[i].split('.')
              .reduce(function (object, property) {
                return object[property];
              }, item);

            if (self.columns[i].type == 'date') {
              const data = new Date(valorColuna);
              const dia = data.getDate().toString().padStart(2, '0');
              const mes = (data.getMonth() + 1).toString().padStart(2, '0');
              const ano = data.getFullYear();
              const dataFormatada = `${dia}/${mes}/${ano}`;
              if ( self.filter_data[table_columns[i]] &&  dataFormatada.toString().toLowerCase().indexOf(self.filter_data[table_columns[i]].toLowerCase()) === -1) {
                return false;
              }
            } else {
              if (table_columns[i] in self.filter_data && valorColuna.toString().toLowerCase().indexOf(self.filter_data[table_columns[i]].toLowerCase()) === -1) {
                return false;
              }
            }
          } catch (error) {
            return false;
          }
        }
        return true;
      });
      // eslint-disable-next-line camelcase
      return table_Data;
    },
    getFilteredValuesData () {
      const self = this;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.column_options_selected = Object.assign({}, this.column_options_selected);
      // console.log(this.column_options_selected);
      // eslint-disable-next-line camelcase
      const table_Data = this.getFilteredData.filter(function (item) {
        let i = '';
        for (i = 0; i < self.columns.length; i++) {
          if (self.column_options_selected[self.columns[i].field].length === 0) { continue; }
          try {
            console.log(self.column_options_selected[self.columns[i].field]);
            if (self.column_options_selected[self.columns[i].field] !== item[self.columns[i].field].toString()) {
              return false;
            }
          } catch (error) {
            return false;
          }
        }
        return true;
      });
      // eslint-disable-next-line camelcase
      return table_Data;
    },
    hasDefaultSlot () {
      // eslint-disable-next-line no-prototype-builtins
      return this.$slots.hasOwnProperty('body');
    }
  },
  watch: {
    selected_prop: function () {
      this.$emit('selected-val', this.selected_prop);
    }
  },
  created () {
    this.uuid = uid();
    // console.log(this.selection===undefined);
    if (this.selection === undefined) {
      this.selection_prop = 'none';
    } else {
      this.selection_prop = this.selection;
    }
    if (this.file_name === undefined) {
      this.name = 'Download';
    } else {
      this.name = this.file_name;
    }
    if (this.selected === undefined) {
      this.selected_prop = [];
    } else {
      this.selected_prop = this.selected;
    }
    const self = this;
    self.column_options = {};
    self.columns.filter(function (item) {
      self.column_options[item.field] = [];
      self.column_options_selected[item.field] = [];
      self.filter_flags[item.field] = false;
      return item;
    });
    self.data.filter(function (item) {
      self.columns.filter(function (column) {
        self.column_options[column.field].push({
          label: item[column.field].toString(),
          value: item[column.field].toString().toLowerCase().replace(/_/g, '_')
        });
      });
    });
    self.columns.filter(function (column) {
      self.column_options[column.field] = [...new Map(self.column_options[column.field].map(item =>
        [item.value, item])).values()];
    });
  },
  methods: {
    exportTable (type) {
      // naive encoding to csv format
      const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
        this.data.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            // eslint-disable-next-line no-void
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n');
      const status = exportFile(
        this.file_name + '.' + type,
        content,
        'text/' + type
      );
      if (status !== true) {
        this.$q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        });
      }
    }
  }
};
</script>

<style scoped>
</style>
