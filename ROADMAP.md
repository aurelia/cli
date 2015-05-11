#Aurelia-cli ROADMAP

##Architecture

 The following is an example with descriptions about the architecture for the cli.

 Please feel free to raise any concerns


###bin/
    Contains the executable js file

###commands/
    Contains the logic for each executable command. 
    If the command requires extra logic from a separate file, and the separate file **ONLY** contains logic that pertains to the specified command, then create a directory with the name of the command, and put the initial logic in an index.js file. Any external logic should go in the folder.
    If the command includes templates, and the templates only pertain to the specified command, you should also create a folder, and place the templates within this folder... inside a templates folder

**Example of a Single File Command**
```
commands/
    init.js
```

**Example of a Multi File Command**
```bash
commands/
    init/
        index.js #contains logic from the above init.js
        otherlogic.js
```

**Command including Templates**
```bash
commands/
    init/
        index.js #contains logic from the above init.js
        templates/
            Aureliafile.js # template to be generated
```


###lib/
    Contains logic that is shared between the cli and any commands. 
    This directory also includes a templates folder for any templates that are shared between commands.
