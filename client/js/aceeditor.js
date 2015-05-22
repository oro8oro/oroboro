Template.aceEditor.rendered = function(){
    var editor = ace.edit("aceEditor");
    //editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().setUseWrapMode(true);
    editor.getSession().on('change', function() {
        //console.log(editor.getSession().getValue())
        //parent.updater(editor.getSession().getValue());
    });
    editor.commands.addCommand({
        name: 'Debug',
        bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
        exec: function(editor) {
            parent.debug(editor);
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });

    editor.commands.addCommand({
        name: 'Help',
        bindKey: {win: 'Ctrl-H',  mac: 'Command-H'},
        exec: function(editor) {
            parent.help(editor);
        },
        readOnly: true // false if this command should not apply in readOnly mode
    });
}
