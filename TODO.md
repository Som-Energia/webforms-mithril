# Pending Tasks

- [x] Ask comer: Check whether closure measure is needed or not
- [x] PersonalData: Checkbox privacy policy -> LegalConsent widget

- [ ] Skip closure page
- [ ] PersonalData: Move translations from angular 
- [ ] Validations: Move translations from angular 
- [ ] Review untranslated texts
- [ ] Static tools for compiling translations (i18n4v?)
- [ ] Ask Legal: privacy concerns on showing CUPS Address
- [ ] PersonalData: new field for firm name
- [ ] PersonalData: Proxy fields layout
- [ ] PaymentPage: Checkbox sepa -> LegalConsent widget
- [ ] SummaryPage: Checkbox terms -> LegalConsent widget
- [ ] SummaryPage: All information
- [ ] SuccessPage: Mejorar textos
- [ ] SuccessPage: Improve format (card?)
- [ ] FailurePage: Improve format (card?)
- [ ] FailurePage: Backlinks
- [ ] Select: Delayed programatic fill in when options depend on an API call
- [ ] Wizard: Rethink tab navigation
- [ ] Wizard: Disable hidden pages
- [ ] Wizard: Default action 'next' when enter key pressed
- [ ] TextField: translate 'required'
- [ ] Wizard: Option to fix size content with scroll
- [ ] PageSlider: whenever we change page, scroll it up
- [ ] PageSlider: On jump, focus the first element
- [ ] Dialog: Option to not jumping to the first control
    - [ ] Dialog: Hack, hidden control on the top

# Not for now?

- [ ] LegalConsent: Split dialog and checkbox to avoid overlaps of later html
- [ ] ValidatedField: Do not validate until a regexp applies
- [ ] Take form language from query or token
- [ ] Set language field to form language by default

# Discarded

- [ ] Datepicker: make dialog modal
- [ ] Closurepage: fix layout

# Old ones, to review 2019-01-17

## Cosas que vamos dejando al lado por focus

- [x] Error de password invalido con efecto en el campo
- [ ] HELP URL: I don't have an Spanish VAT
- [ ] HELP URL: I don't remember my password
- [ ] password, si falla focus en el password
- [ ] VAT: evitar los check cuando sea corto
- [ ] VAT: el limite de 9 caracteres es correcto?
- [x] TextField: programatic set/unset, moves the label
- [x] TextField: programatic set/unset, updates outline
- [x] TextField: En algunos casos el cambio de foco mueve el label (dependia de value attribute no del value)


## Current focus

- [x] Remove form-field from selects
- [x] Remove form-field from textfields
- [x] load form-field css for checkboxes
- [x] Keybindings for the showall mode
- [x] Idioma per codi
- [x] Language chooser component
- [x] Personal data validation
- [x] Recover person validation from angular: telephon, postalcode, dni, email
- [x] Development shortcuts
- [x] Extract personaldata into its own component
- [X] Volver a activar el js en el checkbox
- [X] Postal code, el dona per valid abans de tenir els 5 digits


# Millestone: formulario minimo de cambio de titular por iniciativa del nuevo titular

## Componentes

- [x] Introduccion de fecha
- [ ] Selector CNAE
- [ ] Select: Setting language by default
- [ ] Select: Setting language by programming
- [ ] Select: Setting country by default
- [ ] Select: Setting country by programming
- [ ] Select: Setting state by default
- [ ] Select: Setting state by programming
- [ ] ValidatedFiel: Setting validated by default
- [ ] ValidatedFiel: Setting validated by programming

- [ ] Fer servir jsdoc-external-example per separar els exmples i que surtin a la documentacio


### New wizard

- [x] Progress bar
- [x] Slide de pagina
- [x] Logica no linial

### Terms Acceptation

- Checkbox by default unchecked
- Attributes
	- checkbox text
	- model object
	- license url or html
- Intercept click on checkbox
- Show scrollable dialog with a given text
- On accept mark state checked
- On reject mark state unchecked


## Intro

- [ ] simular el caso tonto en el authorization
- [ ] Texto de entrada para el caso de que necesitamos el dni
- [ ] Bug: next al dni vuelve a preguntar el dni

- [ ] Introducir el cups en el welcome newuser
- [ ] Introducir el cups en el welcome olduser
- [ ] Error si atr en curso

- [ ] Detectar caso no socio y cups no nuestro, y obligar a hacerse
- [ ] Detectar caso no socio y cups nuestro, y sugerir hacerse

- [ ] Define texts
- [ ] Translate texts

- [ ] Integracion cas (para later)

## Dades Contractant


- [x] Añadir campos de representante legal en caso de legal entity
    - Validació Nif del representant: ha de ser de p. física
- [x] Eliminar NIF i password en dades contractant

## Condicions

- [ ] Skip Alta? y NouTitular? si cups existeix
- [ ] CNAE siempre: primero si es un domicilio y si no preguntar CNAE
- [ ] Si es nuestro y es cambio titular, Quieres poner una fecha de cambio con lectura?
- [ ] Si quiere fecha de lectura, Lectura? Fecha?

### Later

- [ ] Marcar el correu duplicat com a invalid quan no coincideix
- [ ] Marcar invalids camps de potencia Pn quan cap dels tres es >15
- [ ] Marcar invalid camp de potencia Pn si es major del tope per 3.1 (O explicar que cal contractacio especial)


## Pagament

- [ ] Poner textos
- [ ] Preguntar si es vol fer soci


## Review

- [ ] ReviewCard: Informacion clave valor, con un titulo
- [ ] Textos para que quede claro que AUN NO ESTAMOS!!!


## Post

- [ ] Evaluar si es mejor reaprovechar el flask existente o reacer para definir que parametros hay que enviar
- [ ] Recopilar la informacion a enviar en el post
- [ ] Respuesta success
- [ ] Analisis de casos de fallo
- [ ] Respuesta fallo



## Postponed task (to get them out of the way but not forgetting about them)


- Select label colors (focus and not) are not as dimmer as in textfields


- NIF?
    - Token contratacion desde OV o no
    - Validados en el CAS o no
    - Validados en OV o no
    - En los casos que todo no puede aun ser usuario o no
    - API NIF:
        - valido o invalido
        - fisica o juridia
        - usuario o no
        - socio o no




