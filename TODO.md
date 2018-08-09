# Pending Tasks


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

- [ ] Introduccion de fecha
- [ ] Selector CNAE
- [ ] Setting language by default
- [ ] Setting language by programming
- [ ] Setting country by default
- [ ] Setting country by programming
- [ ] Setting state by default
- [ ] Setting state by programming
- [ ] Setting validated by default
- [ ] Setting validated by programming


### New wizard

- Progress bar
- Slide de pagina
- Logica no linial

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


- [ ] Añadir campos de representante legal en caso de legal entity
    - Validació Nif del representant: ha de ser de p. física
- [ ] Eliminar NIF i password en dades contractant
- [ ] Take form language from query or token
- [ ] Set language field to form language by default
- [ ] Translate texts

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




