import 'moment/locale/pt-br';
import moment from 'moment';
import constantes from './constantes';

moment.locale('pt-br');

const GeralService = {
  configuracoes: {
    BASE_S3: "https://azimuteweb.s3.sa-east-1.amazonaws.com/",
    // BASE_S3: process.env.BASE_S3,
    //BASE_REST: "https://atleta.esp.br/azimutewebws/",
    // BASE_REST: "http://localhost:3005/",
    BASE_REST: "https://cbo.esp.br/azimuteweb-ws/",
    //BASE_REST: "http://192.168.0.48:3005/",
    // BASE_REST: "http://192.168.3.29:3005/",
    id: "5d6934fc9b35767d7398c823",
    _urj: "batatinhaloca"
  },
  async getId() {
    const ret = await useCustomFetch("id", "get");
    if (ret.valido) {
      return ret.id;
    } else {
      return undefined;
    }
  },
  invertColor(bg) {
    if (!bg) return bg;
    bg = parseInt(Number(bg.replace('#', '0x')), 10);
    bg = ~bg;
    bg = bg >>> 0;
    bg = bg & 0x00ffffff;
    bg = '#' + bg.toString(16).padStart(6, '0');
    return bg;
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
  removeCaracteresEspeciais(str) {
    try {
      // eslint-disable-next-line no-useless-escape
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/([^\w]+|\s+)/g, '-') // Substitui espaço e outros caracteres por hífen
        // eslint-disable-next-line no-useless-escape
        .replace(/\-\-+/g, '-') // Substitui multiplos hífens por um único hífen
        .replace(/(^-+|-+$)/, '').toLowerCase(); // Remove hífens extras do final ou do inicio da string
    } catch (error) {
      return '';
    }


  },
  async getNewPagamento(
    tipoIdentificador,
    identificadorId,
    entidadeResponsavelId,
    taxaAdministrativa,
    pessoaDevedoraId
  ) {
    return {
      _id: await this.getId(),
      identificador: identificadorId,
      tipoIdentificador: tipoIdentificador,
      entidade: entidadeResponsavelId,
      tipo: "Cartão",
      agenteFinanceiro: "Azimute Certo",
      pessoaDevedora: pessoaDevedoraId,
      cartao: this.configuracoes.production ? {} : this.getTesteCartao(),
      tipoPessoa: "Física",
      // sacado: store.state.geral.pessoa.nome,
      // cpfCnpj: store.state.geral.pessoa.cpf,
      // email: store.state.geral.pessoa.email,
      // telefone: store.state.geral.pessoa.telefones[0],
      // boletoEndereco: store.state.geral.pessoa.enderecos[0],
      // dataVencimento: moment()
      //   .add(1, "day")
      //   .utc()
      //   .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      status: "Pendente",
      valorBruto: 0,
      valorAcrescimo: 0,
      valorDesconto: 0,
      valorLiquido: 0,
      taxaAdministrativa: taxaAdministrativa,
      arranjoPagamento: [],
      historico: [],
    };
  },
  getTesteCartao() {
    // return {};
    return {
      CardNumber: "5105105105105100",
      cartaoValido: true,
      Brand: "Visa",
      Holder: "Teste",
      SecurityCode: "123",
      ExpirationDate: "11/24",
      dataValida: true,
    };
  },
  formatoTelefone(phoneNumber) {
    return phoneNumber.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  },
  getCorStatusInscricao(status) {
    switch (status) {
      case "Iniciada":
        return "accent";
      case "Aguardando o Pagamento":
        return "warning";
      case "Finalizada":
        return "positive";
      case "Recusada":
        return "negative";
      default:
        return "blue-gray-6";
    }
  },
  getTaxaAzimuteCerto(evento) {
    if (evento && evento.entidadeResponsavel) {
      if (evento.taxaAzimuteCerto) {
        return evento.taxaAzimuteCerto;
      } else {
        return evento.entidadeResponsavel.taxaAzimuteCerto;
      }
    } else {
      return 10;
    }
  },
  getUrlImagem(imageData, obj, field, imageUrl) {
    if (imageData === null) {
      return '';
    } else {
      if (imageData === '') {
        if (obj[field] === undefined || obj[field] === '') {
          return '';
        }
        return this.configuracoes.BASE_S3 + obj[field];
      } else {
        return imageUrl;
      }
    }
  },
  getUrlS3Thumb(caminho, tumb) {
    if (caminho) {
      const arrayC = caminho.split("/");
      const fileName = arrayC[arrayC.length - 1];
      let caminhoNovo = "";
      for (let i = 0; i < arrayC.length; i++) {
        if (i < arrayC.length - 1) {
          caminhoNovo += arrayC[i] + "/";
        }
      }
      caminhoNovo +=
        "thumbnail-" +
        (tumb.width ? "W" + tumb.width : "") +
        (tumb.width && tumb.height ? "x" : "") +
        (tumb.height ? "H" + tumb.height : "") +
        "-" +
        fileName;
      return this.configuracoes.BASE_S3 + caminhoNovo;
    }
  },
  getUrlS3(caminho) {
    return this.configuracoes.BASE_S3 + caminho;
  },
  getColor(abrangencia) {
    switch (abrangencia) {
      case "Municipal":
        return "#d6b50d";
      case "Estadual":
        return "#4AABC5";
      case "Regional":
        return "#7030A0";
      case "Nacional":
        return "#92D050";
      case "Continental":
        return "#5A59E6";
      case "Mundial":
        return "#92D050";
      default:
        return "#e65100";
    }
  }, numeroParaMoeda(n, c, d, t) {
    let s;
    let i;
    let j;
    // eslint-disable-next-line
    (c = isNaN((c = Math.abs(c))) ? 2 : c),
      (d = d === undefined ? "," : d),
      (t = t === undefined ? "." : t),
      (s = n < 0 ? "-" : ""),
      (i = parseInt((n = Math.abs(+n || 0).toFixed(c))) + ""),
      (j = (j = i.length) > 3 ? j % 3 : 0);
    // eslint-disable-next-line
    return (
      s +
      (j ? i.substr(0, j) + t : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
      (c
        ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
        : "")
    );
  },

  getDia(isoData) {
    return isoData ? isoData.substring(8, 10) : "";
  },
  /**
* Get the number of days in any particular month
* @link https://stackoverflow.com/a/1433119/1293256
* @param  {integer} m The month (valid: 0-11)
* @param  {integer} y The year
* @return {integer}   The number of days in the month
*/
  daysInMonth(m, y) {
    switch (m) {
      case 1:
        return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28;
      case 8: case 3: case 5: case 10:
        return 30;
      default:
        return 31;
    }
  },
  /**
* Check if a date is valid
* @link https://stackoverflow.com/a/1433119/1293256
* @param  {[type]}  d The day
* @param  {[type]}  m The month
* @param  {[type]}  y The year
* @var {Number} hg Exemplo Soma o tal do não sei o que
* @return {Boolean}   Returns true if valid
*/
  isValidDate(d, m, y) {
    m = parseInt(m, 10) - 1;
    return m >= 0 && m < 12 && d > 0 && d <= this.daysInMonth(m, y);
  },
  /**
* Check if a date is valid
* @link https://stackoverflow.com/a/1433119/1293256
* @param  {[type]}  strDate The date in format Quasar "YYYY/MM/DD"
* @param  {[type]}  m The month
* @param  {[type]}  y The year
* @return {Boolean}   Returns true if valid
*/
  isValidDateYMD(strDate) {
    if (strDate !== undefined && strDate.length < 10) {
      return false;
    } else {
      return this.isValidDate(strDate.substr(8, 2), strDate.substr(5, 2), strDate.substr(0, 4));
    }
  },
  getIniciais(name) {
    var parts = name.split(" ");
    var initials = "";

    // for (var i = 0; i < parts.length; i++) {
    //   if (parts[i].length > 0 && parts[i] !== "") {
    //     initials += parts[i][0];
    //   }
    // }  
    if (parts.length > 1) {
      initials = parts[0][0];
      initials += parts[parts.length - 1][0];
    } else {
      initials = parts[0][0];
    }
    return initials;
  },

  // pegar todas os iniciais das palavras ignorando as preposições e conjunções
  getIniciaisCompleto(name) {
    var parts = name.toLowerCase().split(" ");
    var initials = "";

    for (var i = 0; i < parts.length; i++) {
      if (parts[i].length > 0 && parts[i] !== "") {
        if (
          parts[i] !== "de" &&
          parts[i] !== "da" &&
          parts[i] !== "do" &&
          parts[i] !== "dos" &&
          parts[i] !== "das" &&
          parts[i] !== "e" &&
          parts[i] !== "a" &&
          parts[i] !== "o" &&
          parts[i] !== "as" &&
          parts[i] !== "os" &&
          parts[i] !== "em" &&
          parts[i] !== "no" &&
          parts[i] !== "na" &&
          parts[i] !== "nos" &&
          parts[i] !== "nas" &&
          parts[i] !== "um" &&
          parts[i] !== "uma" &&
          parts[i] !== "uns" &&
          parts[i] !== "umas" &&
          parts[i] !== "pelo" &&
          parts[i] !== "pela" &&
          parts[i] !== "pelos" &&
          parts[i] !== "pelas" &&
          parts[i] !== "ao" &&
          parts[i] !== "aos" &&
          parts[i] !== "à" &&
          parts[i] !== "às" &&
          parts[i] !== "dum" &&
          parts[i] !== "duma" &&
          parts[i] !== "duns" &&
          parts[i] !== "dumas" &&
          parts[i] !== "num" &&
          parts[i] !== "numa" &&
          parts[i] !== "nuns" &&
          parts[i] !== "numas"
        ) {
          initials += parts[i][0];
        }
      }
    }
    return initials.toUpperCase();
  },

  getIdade(nascimento) {
    return moment().diff(nascimento, "years", true);
  },
  getMes(isoData) {
    return isoData ? isoData.substring(5, 7) : "";
  },

  getDataFormatada(dt, formato) {
    // // console.log("eta"+moment.locale('pt-br'));
    if (!dt) {
      return "";
    }
    if (formato) {
      return moment(dt).locale('pt-br').format(formato);
    } else {
      return moment(dt).format("DD/MM/YYYY");
    }
  },
  getCPFFormatado(cpf) {
    if (cpf && cpf.length == 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return cpf;
    }
  },

  getDataAtualMenosDiasToISO(dias) {
    return moment().subtract(dias, "days").toISOString();
  },

  getDataHoraFormatada(dt) {
    return this.getDataFormatada(dt, "DD/MM/YYYY HH:mm");
  },

  getDiffDateAtual(ts) {
    const diff = ts - moment().locale("pt-br").valueOf();
    return diff
    // // execution
    // let f = moment.utc(diff).format("HH:mm:ss.SSS");
  },


  getDuration(times, formato) {

    return moment.utc(times).format(formato);

    // return `${moment
    //   .duration(times)
    //   .asHours()
    //   .toFixed(0)
    //   .toString()
    //   .padStart(2, "0")}:${moment
    //   .duration(times)
    //   .minutes()
    //   .toString()
    //   .padStart(2, "0")}:${moment
    //   .duration(times)
    //   .seconds()
    //   .toString()
    //   .padStart(2, "0")}`;
  },

  mesExtenso(isoData) {
    switch (this.getMes(isoData)) {
      case "01":
        return "Jan";
      case "02":
        return "Fev";
      case "03":
        return "Mar";
      case "04":
        return "Abr";
      case "05":
        return "Mai";
      case "06":
        return "Jun";
      case "07":
        return "Jul";
      case "08":
        return "Ago";
      case "09":
        return "Set";
      case "10":
        return "Out";
      case "11":
        return "Nov";
      case "12":
        return "Dez";
      default:
        return "";
    }
  },

  getExtencao(nome) {
    if (nome !== undefined && nome.length > 5) {
      const temp = nome.split(".");
      return temp[temp.length - 1];
    } else {
      return undefined;
    }
  },
  getIconeFA(nome) {
    const ext = this.getExtencao(nome);
    if (ext) {
      if (ext == "doc" || ext == "docx") {
        return "fa-solid fa-file-word";
      } else if (ext == "xls" || ext == "xlsx") {
        return "fa-solid fa-file-word";
      } else if (ext == "pdf") {
        return "fa-solid fa-file-pdf";
      } else if (ext == "jpg" || ext == "jpeg" || ext == "png") {
        return "fa-solid fa-file-image";
      } else {
        return "fa-solid fa-file";
      }
    } else {
      return "fa-solid fa-file";
    }
  },

  validateDate(date) {
    let dateformat = /^(0?[1-9]|[1-2][0-9]|3[01])[\/](0?[1-9]|1[0-2])/;
    // // console.log(date);

    // Matching the date through regular expression
    if (date.match(dateformat)) {
      let operator = date.split("/");

      // Extract the string into month, date and year
      let datepart = [];
      if (operator.length > 1) {
        datepart = date.replaceAll("_", "").split("/");
      }
      let day = parseInt(datepart[0]);
      let month = parseInt(datepart[1]);
      // // console.log(datepart[2]);
      if (datepart[2].length < 4) {
        // // console.log(datepart[2]);
        return false;
      }
      let year = parseInt(datepart[2]);

      // Create a list of days of a month
      let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month == 1 || month > 2) {
        if (day > ListofDays[month - 1]) {
          //to check if the date is out of range
          // console.log("Invalid date");
          return false;
        }
        if (month > 12 || month < 1) {
          return false;
        }
      } else if (month == 2) {
        let leapYear = false;
        if ((!(year % 4) && year % 100) || !(year % 400)) leapYear = true;
        if (leapYear == false && day >= 29) {
          // console.log("Invalid date");
          return false;
        } else if (leapYear == true && day > 29) {
          // console.log("Invalid date format!");
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  },
  arredonda(valor, casas) {
    if (casas == undefined || casas == null) {
      return parseFloat(valor.toFixed(2));
    } else {
      return parseFloat(valor.toFixed(casas));
    }
  },
  moverParaCima(array, index) {
    if (index > 0) {
      this.move(array, index, index - 1);
    }
  },

  moverParaBaixo(array, index) {
    if (index < (array.length - 1)) {
      this.move(array, index, index + 1);
    }
  },

  move(arr, oldIndex, newIndex) {
    while (oldIndex < 0) {
      oldIndex += arr.length;
    }
    while (newIndex < 0) {
      newIndex += arr.length;
    }
    if (newIndex >= arr.length) {
      var k = newIndex - arr.length;
      while ((k--) + 1) {
        arr.push(undefined);
      }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  },

  removeMascara(obj) {
    if (obj !== undefined && obj.length > 0) {
      return obj.replace(/[^0-9]/g, "");
    } else {
      return obj;
    }
  },

  getThumb(caminho, tumb) {
    if (caminho) {
      const arrayC = caminho.split("/");
      const fileName = arrayC[arrayC.length - 1];
      let caminhoNovo = "";
      for (let i = 0; i < arrayC.length; i++) {
        if (i < arrayC.length - 1) {
          caminhoNovo += arrayC[i] + "/";
        }
      }
      caminhoNovo +=
        "thumbnail-" +
        (tumb.width ? "W" + tumb.width : "") +
        (tumb.width && tumb.height ? "x" : "") +
        (tumb.height ? "H" + tumb.height : "") +
        "-" +
        fileName;
      return caminhoNovo;
    }
  },

  async buscarCep(cep) {

    if (cep) {
      const { data: response } = await useFetch(`https://viacep.com.br/ws/${this.removeMascara(cep)}/json/`)
      return response._rawValue;
    } else {
      return { erro: true }
    }



    // if (response.status === 200) {
    //   if (response.data.erro) {
    //     Notify.create({
    //       color: "warning",
    //       position: "top",
    //       message: "CEP não localizado!",
    //       icon: "warning",
    //     });
    //     return undefined;
    //   } else {
    //     return {
    //       bairro: response.data.bairro,
    //       cidade: response.data.localidade,
    //       uf: response.data.uf,
    //       logradouro: response.data.logradouro,
    //       ibge: response.data.ibge,
    //       ddd: response.data.ddd,
    //     };
    //   }
    // } else {
    //   Notify.create({
    //     color: "negative",
    //     position: "top",
    //     message: "Falha ao buscar cep!",
    //     icon: "error",
    //   });
    //   return undefined;
    // }
  },
  getLista(lista, value, label, filtro, retornoValueLabel) {
    const newLista = [];
    const filtroKeys = filtro !== undefined ? Object.keys(filtro) : [];
    for (let index = 0; index < lista.length; index++) {
      const element = lista[index];
      let continua = true;
      for (let index2 = 0; index2 < filtroKeys.length; index2++) {
        if (element[filtroKeys[index2]] !== filtro[filtroKeys[index2]]) {
          continua = false;
          break;
        }
      }
      if (continua) {
        let v = '';
        if (value === 'obj') {
          v = element;
        } else if (value === '__lista') {
          v = { id: element.id, descricao: element.descricao };
        } else {
          v = element[value];
        }
        if (retornoValueLabel === undefined || retornoValueLabel === null || retornoValueLabel === false || retornoValueLabel === '') {
          newLista.push({ value: v, label: element[label] });
        } else if (retornoValueLabel === true) {
          newLista.push({ value: v, label: v + ' - ' + element[label] });
        } else {
          newLista.push({ value: v, label: element[retornoValueLabel] + ' - ' + element[label] });
        }
      }
    }
    return newLista;
  },
  getTelefonePadrao(tipo, princ, telefone) {
    return {
      open: true,
      principal: princ,
      numero: telefone,
      ddd: '',
      divulgarNoSite: false,
      tipo: (tipo !== undefined) ? tipo : 'Celular'
    };
  },
  async getEnderecoPadrao(tipo, princ) {
    return {
      open: true,
      principal: (princ !== undefined) ? princ : false,
      logradouro: '',
      numero: '',
      desbloquearEndereco: false,
      cidade: '',
      bairro: '',
      cep: '',
      ddd: '',
      pais: 'Brasil',
      cepValidado: false,
      googleValidado: false,
      divulgarNoSite: false,
      localizacao: {
        lat: -15.799678,
        lng: -47.860754
      },
      uf: 'PR',
      tipo: (tipo !== undefined) ? tipo : 'Residencial'
    };
  },
  async getUltimaMovimentacao(contaId) {
    const url = 'financeiroMovimentacao/getPopulate';
    const tipo = 'post';
    const retMovimentacao = await useCustomFetch(url, tipo, {
      filtro: {
        lixo: false,
        conta: contaId
      },
      sort: {
        created_at: -1
      },
      limit: 1,
      select: {
        saldoAtual: 1
      }
    }, undefined);
    return retMovimentacao;
  },
  async uploadFileAsync(file, caminho, name, thumbnails) {
    const fd = new FormData();
    fd.append('file1', file, name);
    fd.append('caminho', caminho);
    if (thumbnails) {
      fd.append('thumbnails', JSON.stringify(thumbnails));
    }
    const ret = await useCustomFetch('api/uploadS3', 'post', fd, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (ret.data && ret.valido) {
      return true;
    } else {
      // console.log(ret);
      Loading.hide();
      console.error(ret.data);
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Falha ao fazer upload: ' + ret.data,
        icon: 'warning'
      });
      return false;
    }
  },
  async uploadImagem(blobImage, fileName, caminho, tipo, thumbnails) {
    const fd = new FormData();
    fd.append('file1', blobImage, fileName.split('.')[0] + '.' + ((tipo !== undefined) ? tipo : 'jpg'));
    fd.append('caminho', caminho);
    if (thumbnails) {
      fd.append('thumbnails', JSON.stringify(thumbnails));
    }
    // console.log(fd);

    try {
      const ret = await useCustomFetch("api/uploadS3", "post", fd, undefined);

      if (!ret.valido) {
        Loading.hide();
        console.error(ret.data);
        Notify.create({
          color: 'negative',
          position: 'top',
          message: 'Falha ao fazer upload da imagem: ' + ret.data.message,
          icon: 'warning'
        });
      } else {
        // console.log(ret);
      }
    } catch (error) {
      // console.log(error);
      return false;
    }
    return true;
  },
  async uploadFile(blobFile, fileName, caminho) {
    const fd = new FormData();
    fd.append('file1', blobFile, fileName);
    fd.append('caminho', caminho);
    try {
      const ret = await useCustomFetch("api/uploadS3", "post", fd, undefined);
      if (!ret.valido) {
        Loading.hide();
        console.error(ret.data);
        Notify.create({
          color: 'negative',
          position: 'top',
          message: 'Falha ao fazer upload do arquivo: ' + ret.data.message,
          icon: 'warning'
        });
      } else {
        // console.log(ret);
      }
    } catch (error) {
      // console.log(error);
      return false;
    }
    return true;
  },
  async deleteImagem(caminho1, thumbnails) {
    if (!thumbnails) {
      thumbnails = constantes.THUMBNAILS;
    }
    return await this.deleteFile(caminho1, thumbnails);
  },
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },
  async deleteFile(caminho1, thumbnails) {
    // Deleta o arquivo original mais os thumbs

    if (caminho1 == 'CBO/site-antigo/Eventos/Banners/banner-padrao.png') {
      return true;
    }

    const caminhos = [caminho1];
    if (thumbnails) {
      for (let index = 0; index < thumbnails.length; index++) {
        const tumb = thumbnails[index];
        const arrayC = caminho1.split('/');
        const fileName = arrayC[arrayC.length - 1];
        let caminhoNovo = '';
        for (let i = 0; i < arrayC.length; i++) {
          if (i < (arrayC.length - 1)) {
            caminhoNovo += arrayC[i] + '/';
          }
        }
        caminhoNovo += 'thumbnail-' + ((tumb.width) ? ('W' + tumb.width) : '') + ((tumb.width && tumb.height) ? 'x' : '') + (tumb.height ? ('H' + tumb.height) : '') + '-' + fileName;
        caminhos.push(caminhoNovo);
      }
    }
    let deletouOriginal = false;

    for (let index = 0; index < caminhos.length; index++) {
      const caminho = caminhos[index];


      const ret = await useCustomFetch("api/deleteS3", "post", {
        caminho: caminho
      });

      if (ret.valido) {
        if (index === 0) {
          deletouOriginal = true;
        }
      }

    }
    return deletouOriginal;
  },
  getRandomName() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  },
  async executaUpload(obj, field, imageData, insercao, tipo, caminho, callBackSuccess, thumbnails, ignorarDelete) {
    if (imageData !== null && imageData !== '') {
      let oldName = '';
      if (obj[field] && obj[field].length > 0) {
        oldName = obj[field];
      }
      const randonName = this.getRandomName() + '.' + tipo;

      // No caso de update a imagem já existente é substituída.
      let ret = await this.uploadImagem(
        imageData,
        randonName,
        caminho,
        tipo,
        thumbnails
      );
      if (ret) {
        // No caso de sucesso do upload
        obj[field] = caminho + randonName;
        if (!insercao && oldName !== '') {
          if (oldName == 'CBO/site-antigo/Eventos/Banners/banner-padrao.png') {
            ignorarDelete = true;
          }
          if (!ignorarDelete) {
            this.deleteImagem(oldName, thumbnails);
          }
        }
        callBackSuccess(obj, randonName);
      }
    } else {
      // No caso de edição não altera a imagem.
      if (insercao) {
        // obj[field] = '';
      } else if (imageData === null) {
        // Função para deletar a imagem
        if (obj[field] !== '') {
          this.deleteImagem(obj[field], thumbnails);
          obj[field] = '';
        }
      }
      callBackSuccess(obj);
    }
  },
  token: "",
  async getNewPagamento(
    tipoIdentificador,
    identificadorId,
    entidadeResponsavelId,
    taxaAdministrativa
  ) {
    return {
      _id: await this.getId(),
      identificador: identificadorId,
      tipoIdentificador: tipoIdentificador,
      entidade: entidadeResponsavelId,
      tipo: "PIX",
      agenteFinanceiro: "Azimute Certo",
      pessoaDevedora: store.state.geral.pessoa._id,
      cartao: $configuracoes.production ? {} : this.getTesteCartao(),
      tipoPessoa: "Física",
      sacado: store.state.geral.pessoa.nome,
      cpfCnpj: store.state.geral.pessoa.cpf,
      email: store.state.geral.pessoa.email,
      telefone: store.state.geral.pessoa.telefones[0],
      boletoEndereco: store.state.geral.pessoa.enderecos[0],
      dataVencimento: moment()
        .add(1, "day")
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
      status: "Pendente",
      taxaAdministrativa: taxaAdministrativa,
      arranjoPagamento: [],
      historico: [],
    };
  },
  getTesteCartao() {
    // return {};
    return {
      CardNumber: "5105105105105100",
      cartaoValido: true,
      Brand: "Visa",
      Holder: "Teste",
      SecurityCode: "123",
      ExpirationDate: "11/23",
      dataValida: true,
    };
  },
  getTaxaAzimuteCerto(evento) {
    if (evento && evento.entidadeResponsavel) {
      if (evento.taxaAzimuteCerto) {
        return evento.taxaAzimuteCerto;
      } else {
        return evento.entidadeResponsavel.taxaAzimuteCerto;
      }
    } else {
      return 10;
    }
  },
  verificaElo(numeroCartao) {
    if (parseInt(numeroCartao.substring(0, 5)) === 36297) {
      return true;
    } else {
      switch (parseInt(numeroCartao.substring(0, 4))) {
        case 5067:
        case 4576:
        case 4011:
          return true;
        default: {
          switch (parseInt(numeroCartao.substring(0, 6))) {
            case 636368:
            case 438935:
            case 504175:
            case 451416:
            case 509048:
            case 509067:
            case 509049:
            case 509069:
            case 509050:
            case 509074:
            case 509068:
            case 509040:
            case 509045:
            case 509051:
            case 509046:
            case 509066:
            case 509047:
            case 509042:
            case 509052:
            case 509043:
            case 509064:
              return true;
            default:
              return false;
          }
        }
      }
    }
  },
  verificaAura(numeroCartao) {
    return numeroCartao.substring(0, 2) === "50";
  },
  verificaDiscover(numeroCartao) {
    return (
      numeroCartao.substring(0, 4) === "6011" ||
      numeroCartao.substring(0, 3) === "622" ||
      numeroCartao.substring(0, 2) === "64" ||
      numeroCartao.substring(0, 2) === "65"
    );
  },
  verificaDiners(numeroCartao) {
    return (
      numeroCartao.substring(0, 3) === "301" ||
      numeroCartao.substring(0, 3) === "305" ||
      numeroCartao.substring(0, 2) === "36" ||
      numeroCartao.substring(0, 2) === "38"
    );
  },
  verificaAmex(numeroCartao) {
    return (
      numeroCartao.substring(0, 2) === "34" ||
      numeroCartao.substring(0, 2) === "37"
    );
  },
  verificaJCB(numeroCartao) {
    return numeroCartao.substring(0, 2) === "35";
  },
  verificaVisa(numeroCartao) {
    return numeroCartao.substring(0, 1) === "4";
  },
  verificaMastercard(numeroCartao) {
    return numeroCartao.substring(0, 1) === "5";
  },
  getBandeira(numeroCartao) {
    if (numeroCartao === undefined || numeroCartao.length === 0) {
      return undefined;
    }
    if (this.verificaElo(numeroCartao)) {
      return "Elo";
    }

    if (this.verificaAura(numeroCartao)) {
      return "Aura";
    }

    if (this.verificaDiscover(numeroCartao)) {
      return "Discover";
    }

    if (this.verificaDiners(numeroCartao)) {
      return "Diners";
    }

    if (this.verificaAmex(numeroCartao)) {
      return "Amex";
    }

    if (this.verificaJCB(numeroCartao)) {
      return "JCB";
    }

    if (this.verificaVisa(numeroCartao)) {
      return "Visa";
    }

    if (this.verificaMastercard(numeroCartao)) {
      return "Master";
    }

    return undefined;
  },
  validaDataValidade(strData) {
    if (!strData) {
      return false;
    }

    if (strData.length !== 5) {
      return false;
    }

    const mes = parseInt(strData.substring(0, 2));

    if (mes > 12) {
      return false;
    }

    const year = parseInt("20" + strData.substring(3, 5));
    const yearAtual = new Date().getFullYear();

    if (year < yearAtual) {
      return false;
    } else if (year === yearAtual) {
      const mesAtual = new Date().getMonth();
      if (mes < mesAtual) {
        return false;
      }
    }
    return true;
  },
  cardIsValid(cardNumber) {
    if (cardNumber === undefined || cardNumber.length < 13) {
      return false;
    }

    const number = cardNumber.substring(0, cardNumber.length - 1);
    const doubles = [];

    for (let i = 0; i < number.length; i++) {
      const valor = (
        parseInt(number.substring(i, i + 1)) * (i % 2 === 0 ? 2 : 1)
      ).toString();
      doubles.push(valor);
    }

    let sum = 0;

    for (let i = 0; i < doubles.length; i++) {
      const aDouble = doubles[i];

      for (let j = 0; j < aDouble.length; j++) {
        sum += parseInt(aDouble.substring(j, j + 1));
      }
    }

    return (
      parseInt(
        cardNumber.substring(cardNumber.length - 1, cardNumber.length)
      ) ===
      (10 - (sum % 10)) % 10
    );
  },

  validaCartao(pagamento, modoSandBox) {
    // console.log('aqui');
    if (modoSandBox) {
      if (
        pagamento.cartao.CardNumber &&
        pagamento.cartao.CardNumber.length === 16
      ) {
        pagamento.cartao.cartaoValido = true;
        pagamento.cartao.Brand = "Visa";
      } else {
        pagamento.cartao.Brand = undefined;
        pagamento.cartao.cartaoValido = false;
      }
    } else {
      if (pagamento.cartao.CardNumber) {
        pagamento.cartao.CardNumber =
          pagamento.cartao.CardNumber.toString().replace(
            new RegExp(" ", "g"),
            ""
          );
        if (pagamento.cartao.CardNumber.length > 12) {
          pagamento.cartao.cartaoValido =
            this.cardIsValid(
              pagamento.cartao.CardNumber
            );
          // // console.log("cartao i: " + $scope.cartaoValido);
        } else {
          pagamento.cartao.cartaoValido = false;
        }
      } else {
        pagamento.cartao.cartaoValido = false;
      }
      if (pagamento.cartao.CardNumber) {
        pagamento.cartao.Brand =
          this.getBandeira(
            pagamento.cartao.CardNumber
          );
      } else {
        pagamento.cartao.Brand = undefined;
      }
    }
  },
  validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (!cpf) return false;
    // Elimina CPFs invalidos conhecidos
    if (
      cpf.length !== 11 ||
      cpf === "00000000000" ||
      cpf === "11111111111" ||
      cpf === "22222222222" ||
      cpf === "33333333333" ||
      cpf === "44444444444" ||
      cpf === "55555555555" ||
      cpf === "66666666666" ||
      cpf === "77777777777" ||
      cpf === "88888888888" ||
      cpf === "99999999999"
    ) {
      return false;
    }
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i++) {
      add += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) {
      rev = 0;
    }
    if (rev !== parseInt(cpf.charAt(9))) {
      return false;
    }
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++) {
      add += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) {
      rev = 0;
    }
    if (rev !== parseInt(cpf.charAt(10))) {
      return false;
    }
    return true;
  },
  validarCNPJ: function (cnpj) {
    if (
      !cnpj ||
      cnpj.length !== 14 ||
      cnpj === "00000000000000" ||
      cnpj === "11111111111111" ||
      cnpj === "22222222222222" ||
      cnpj === "33333333333333" ||
      cnpj === "44444444444444" ||
      cnpj === "55555555555555" ||
      cnpj === "66666666666666" ||
      cnpj === "77777777777777" ||
      cnpj === "88888888888888" ||
      cnpj === "99999999999999"
    ) {
      return false;
    }
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    // eslint-disable-next-line eqeqeq
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    // eslint-disable-next-line eqeqeq
    if (resultado != digitos.charAt(1)) return false;
    return true;
  },
}
export default GeralService;