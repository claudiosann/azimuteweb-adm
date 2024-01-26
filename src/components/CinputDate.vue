<template>
  <q-input stack-label lazy-rules bottom-slots ref="input" @focus="$refs.input.select()" v-bind="$attrs"
    v-model="dataQInput"
    :mask="(tipo === 'date') ? '##/##/####' : (tipo === 'datetime') ? '##/##/#### ##:##' : '##/##/#### ##:##:##'"
    :error="error || forceError"
    :error-message="!isValid ? mensagemPadrao : (errorMessage ? errorMessage : mensagemPadrao)" @blur="$emit('blur')">
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="popup">
          <q-date today-btn v-model="calendarModel" @update:model-value="atualizaDataCalendario"
            :mask="(tipo === 'date') ? 'YYYY-MM-DD' : (tipo === 'datetime') ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD HH:mm:ss'"
            :default-year-month="defaultYearMonth">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Fechar" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
      <q-icon v-if="tipo !== 'date'" name="access_time" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time v-model="calendarTime" format24h @update:model-value="atualizaTimeDataCalendario"
            :with-seconds="tipo === 'fulldatetime'">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
      <q-btn v-if="executarFiltro" round dense flat icon="search" @click.stop @click="execultarFiltroData()" />
    </template>
  </q-input>
</template>

<style scoped></style>

<script>

import moment from 'moment';
import 'moment/dist/locale/pt-br';
moment.locale('pt-br');

import {
  date
} from 'quasar';
export default {
  props: {
    // type ira ajustar o mask para utilização de minuto caso precise, por padrão caso não informado, utiliza apenas date
    tipo: {
      type: String,
      default: 'date'
    }, // date, datetime, fulldatetime
    obrigatorio: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: String
    },
    executarFiltro: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    },
    hint: {
      type: String
    },
    // exemplo de optionsDate, pegando datas apartir do dia atual, (passar como function)
    // optionsDate (date) { return date >= moment().format('YYYY/MM/DD'); },
    optionsDate: null
  },
  data() {
    return {
      isValid: true,
      dataQInput: null,
      dataQDate: null,
      calendarModel: null,
      calendarTime: null,
      forceError: false
    };
  },
  created() {
    this.dataQInput = this.getData(false);
    this.dataQDate = this.getData(true);
    this.calendarModel = this.getData(true);
    this.calendarTime = null;
  },
  watch: {
    modelValue(value) {
      if (value) {
        this.dataQInput = this.getData(false);
        this.dataQDate = this.getData(true);
        this.calendarModel = this.getData(true);
        this.calendarTime = null;
      }
    },
    dataQInput(value) {
      this.dataQDate = null;
      this.isValid = true;
      if (value) {
        if (value.length >= 10) {
          if (!this.validaDataHoraInput(value)) {
            this.isValid = false;
            this.forceError = true;
          } else {
            this.forceError = false;
            this.isValid = true;
            this.dataQDate = value;
          }
        } else {
          this.isValid = false;
          this.forceError = true;
        }
      } else if (!(value || '') || value.length === 0) {
        if (this.obrigatorio) {
          this.forceError = true;
          this.isValid = false;
        } else {
          this.isValid = true;
        }
      }
      this.updateDate();
    }
  },
  emits: ['update:modelValue', 'execultarFiltroData', 'blur'],
  computed: {
    defaultYearMonth() {
      return date.formatDate(new Date(), 'YYYY/MM');
    },
    mensagemPadrao() {
      return this.tipo === 'date' ? 'Data inválida!' : 'Data e hora inválida!';
    }
  },
  methods: {
    atualizaDataCalendario(value) {
      if (value) {
        this.dataQDate = value;
        this.dataQInput = value.substr(8, 2) + '/' + value.substr(5, 2) + '/' + value.substr(0, 4);
        if (this.tipo === 'datetime') {
          let time = moment().format('HH:mm');
          this.dataQInput += ' ' + time;
        } else if (this.tipo === 'fulldatetime') {
          let time = moment().format('HH:mm:ss');
          this.dataQInput += ' ' + time;
        }
        this.isValid = true;
      }
    },
    atualizaTimeDataCalendario(value) {
      if (value) {
        this.dataQInput = this.dataQInput.substr(0, 10);
        if (this.tipo === 'datetime') {
          // console.log('teste1', this.dataQInput);
          this.dataQInput += ' ' + value;
        } else if (this.tipo === 'fulldatetime') {
          this.dataQInput += ' ' + value;
        }
        this.isValid = true;
      }
    },
    execultarFiltroData() {
      this.$emit('execultarFiltroData', null);
    },
    getData(tipoQDate) {
      try {
        if (this.modelValue && this.modelValue.length >= 10) {
          if (this.tipo === 'date') {
            if (((String(this.modelValue).substring(4, 5) === '-' && String(this.modelValue).substring(7, 8) === '-') || (String(this.modelValue).substring(4, 5) === '/' && String(this.modelValue).substring(7, 8) === '/'))) {
              if (tipoQDate === true) {
                return moment(this.modelValue).format('YYYY-MM-DD');
              } else {
                return moment(this.modelValue).format('DD/MM/YYYY');
              }
            } else {
              if (((String(this.modelValue).substring(2, 3) === '-' && String(this.modelValue).substring(5, 6) === '-') || (String(this.modelValue).substring(2, 3) === '/' && String(this.modelValue).substring(5, 6) === '/'))) {
                let dataTemp = moment(this.modelValue, 'DD/MM/YYYY').format('YYYY-MM-DD');
                if (tipoQDate === true) {
                  return dataTemp;
                } else {
                  // aqui pego e converto para o tipo brasileiro
                  return moment(dataTemp).format('DD/MM/YYYY');
                }
              }
            }
          } else {
            // sei que esta vindo no padrão BD
            if (String(this.modelValue).toUpperCase().includes('T') || String(this.modelValue).toUpperCase().includes('Z')) {
              if (tipoQDate === true) {
                return moment(this.modelValue).format('YYYY-MM-DD HH:mm:ss');
              } else {
                return moment(this.modelValue).format('DD/MM/YYYY HH:mm:ss');
              }
            } else if (String(this.modelValue).length > 10 && this.isDate(this.modelValue) && ((String(this.modelValue).substring(4, 5) === '-' && String(this.modelValue).substring(7, 8) === '-') || (String(this.modelValue).substring(4, 5) === '/' && String(this.modelValue).substring(7, 8) === '/'))) {
              if (tipoQDate === true) {
                return moment(this.modelValue).format('YYYY-MM-DD HH:mm:ss');
              } else {
                return moment(this.modelValue).format('DD/MM/YYYY HH:mm:ss');
              }
            } else {
              if (String(this.modelValue).length > 10 && this.isDate(this.modelValue) && ((String(this.modelValue).substring(2, 3) === '-' && String(this.modelValue).substring(5, 6) === '-') || (String(this.modelValue).substring(2, 3) === '/' && String(this.modelValue).substring(5, 6) === '/'))) {
                // caso não esteja vindo no padrão bd tento pegar a data e converter para o padrao aqui
                let dataTemp = moment(this.modelValue, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss');
                if (tipoQDate === true) {
                  return dataTemp;
                } else {
                  // aqui pego e converto para o tipo brasileiro
                  return moment(dataTemp).format('DD/MM/YYYY HH:mm:ss');
                }
              }
            }
          }
        } else {
          return '';
        }
      } catch (error) { /* empty */ }
    },
    // dataQInput = DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss
    validaDataHoraInput(val) {
      if (val && (String(val).includes('/') || String(val).includes('-'))) {
        // VERIFICA SE A STRING ESTA VINDO NO PADRÃO BRASIL E CONVERT COM MOMENT ANTES DE VALIDAR
        if ((String(val).substring(2, 3) === '/' || String(val).substring(2, 3) === '-') && (String(val).substring(5, 6) === '/' || String(val).substring(5, 6) === '-')) {
          if (this.tipo === 'date') {
            let dataTemp = moment(val, 'DD/MM/YYYY').format();
            if (this.isDate(dataTemp) && dataTemp > moment('1900-01-01 00:00').format()) {
              return true;
            }
            return false;
          } else {
            if (String(val).length >= 16) {
              let dataTemp = moment(val, 'DD/MM/YYYY HH:mm:ss').format();

              if (this.isDate(dataTemp) && dataTemp > moment('1900-01-01 00:00').format()) {
                return true;
              }
              return false;
            } else {
              return false;
            }
          }
        }
      }
      return false;
    },
    updateDate() {
      if (this.dataQDate) {
        let data = this.dataQDate;
        if (this.tipo === 'date') {
          data = moment(this.dataQDate, 'DD/MM/YYYY').format();
        } else {
          data = moment(this.dataQDate, 'DD/MM/YYYY HH:mm:ss').format();
        }
        if (!this.isValid) {
          this.$emit('update:modelValue', null);
        } else {
          this.$emit('update:modelValue', data);
        }
      } else {
        this.$emit('update:modelValue', null);
      }
    },
    isDate(val) {
      if (val && String(val).length >= 8 && (String(val).includes('/') || String(val).includes('-') || String(val).includes('.'))) {
        const splitTemp1 = String(val).split('/');
        const splitTemp2 = String(val).split('-');
        const splitTemp3 = String(val).split('.');
        if ((Array.isArray(splitTemp1) && splitTemp1.length >= 3) || (Array.isArray(splitTemp2) && splitTemp2.length >= 3) || (Array.isArray(splitTemp3) && splitTemp3.length >= 3)) {
          return !isNaN(Date.parse(val));
        }
      }
      return false;
    },
  }
};
</script>
