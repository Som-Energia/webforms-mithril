'use strict';

const _ = require('./translate');
var m = require('mithril');
var Button = require('./mdc/button');

require('./uploader.styl');

/**
@namespace Uploader
@description A uploader component

@property {string} id - (it won't work if you don't provide one)
@property {string} label - Text to be shown as label of the input
@property {string} name
@property {function} onchange

*/

const Uploader = {};

Uploader.oncreate = function(vn){
    vn.state.input = vn.dom.querySelector('#' + vn.attrs.id);
}

Uploader.oninit = function(vn){

    vn.state.url_upload = ( vn.attrs.url !== undefined ? vn.attrs.url : false );
    vn.state.max_file_size = ( vn.attrs.max_file_size !== undefined ? vn.attrs.max_file_size : 0 );
    vn.state.extensions = ( vn.attrs.extensions !== undefined ? vn.attrs.extensions : [] );
    vn.state.onupload = ( vn.attrs.onupload !== undefined ? vn.attrs.onupload : function(e){} );
    vn.state.onclear = ( vn.attrs.onclear !== undefined ? vn.attrs.onclear : function(e){} );

    vn.state.file = false;
    vn.state.status = "init";
    vn.state.percentage = 0;
    vn.state.error = undefined;
    
    vn.state.clearFile = function(event){
        vn.state.file = false;
        vn.state.status = "init";
        vn.state.percentage = 0;
        vn.state.input.value = '';
        vn.state.onclear();
    }

    vn.state.upload = function(event){

        vn.state.status = "pending";
        vn.state.percentage = 0;
        vn.state.error = undefined;
        vn.state.file = event.target.files[0];

        if( !vn.state.validateFileType() ){
            vn.state.status = "error";
            vn.state.error = `El fitxer té una extensió no permesa!`;
            vn.state.input.value = '';
            return false;
        } 

        if( !vn.state.validateSize() ){
            vn.state.status = "error";
            vn.state.error = `El fitxer supera la mida màxima! (${vn.state.max_file_size} MB)`;
            vn.state.input.value = '';
            return false;
        } 

        var formData = new FormData(); 
        formData.append("image", vn.state.file);

        return m.request({
            method: "POST",
            url: vn.state.url_upload,
            data: formData,
            config: function(xhr) {         

                xhr.upload.addEventListener("progress", function(event) {
                    vn.state.status = "pending";
                    vn.state.percentage = Math.round(100 * event.loaded / event.total);
                    m.redraw();
                });    

                xhr.upload.addEventListener("load", function(event) {
                    vn.state.status = "done";
                    vn.state.percentage = 100;
                    m.redraw();
                });

                xhr.upload.addEventListener("error", function(event) {
                    vn.state.status = "error";
                    vn.state.percentage = 0;
                    m.redraw();
                });
            }        
        }).then(function(resp){
            console.log(resp);
            vn.state.onupload(resp);
        });
    }
    
    vn.state.validateSize = function(){
        const file_size = vn.state.file.size / 1000 / 1000; // MB
        return ( vn.state.max_file_size === 0 || file_size < vn.state.max_file_size );
    }

    vn.state.validateFileType = function(){
        return (new RegExp('(' + vn.state.extensions.join('|').replace(/\./g, '\\.') + ')$')).test(vn.state.file.name);
    }
}

Uploader.view = function (vn) {
    return m(".uploader", { class: vn.state.status }, [
        m("input[type=file]", {
            id: vn.attrs.id,
            name: vn.attrs.name,
            onchange: vn.state.upload
        }),
        m("label", {
            for:vn.attrs.id,
            class: "uploader__button mdc-button mdc-button--outlined mdc-button--dense"
        }, [ m("i",{"aria-hidden":true, class:"mdc-button__icon fa fa-upload"}), vn.attrs.label ]),
        m("label", { class: "uploader__file-name" }, vn.state.file.name !== undefined ? [vn.state.file.name]: '' ),
        m("label", { class: "uploader__file-size" },[
            vn.state.file.size !== undefined ? [ (vn.state.file.size / 1000).toFixed(1) + ' kB']: '',
            vn.state.percentage !== undefined && vn.state.status === 'pending' ? [' (' + vn.state.percentage + ' %)']:'',
        ]), 
        vn.state.file.name !== undefined ? m(Button, { class: 'uploader__clear', dense:true, faicon: 'trash', onclick: vn.state.clearFile }) : '',
        vn.state.error !== undefined ? m('span.error', vn.state.error) : '',
        m(Progress, { percentage: vn.state.percentage })
    ]);
}

const Progress = {};

Progress.view = function(vn) {
    return m(".progress-bar", [
        m(".progress-bar__progress", {
            style: "width:" + vn.attrs.percentage + "%"
        })
    ]);
}

Uploader.Example = {};
Uploader.Example.model = {};
Uploader.Example.view = function() {
    return m(Uploader, {
        id: "example_file",
        name: "example_file",
        label: "Tria un fitxer",
        url: "https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=500ms",
        max_file_size: 5,
        extensions: [".jpg",".png",".gif",".pdf"],
        onupload: function(e){ console.log('on upload!'); },
        onclear: function(e){ console.log('on clear!'); }
    })
};

module.exports = Uploader;