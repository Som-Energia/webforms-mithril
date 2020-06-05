# Escenaris

- Sóc soci de SomEnergia, vull contractar un (altre) contracte en el meu nom
- Vull esdevindre soci de SomEnergia i contractar la llum
- Vull convidar a algú a contractar la llum
- M'ha convidat un soci a contractar la llum
- Soc membre d'una entitat intercooperadora i vull contractar la llum
	- variant: el titular del contracte no sere jo
- He rebut una promoció per contractar la llum sense ser soci
- Sóc titular del contracte del meu pis de lloguer amb SomEnergia i deixo el lloguer
	- Segons el que faci el nou
		- variant: el nou llogater vol quedar-se a SomEnergia
		- variant: el nou llogater vol quedar-se a SomEnergia pero no si si ho farà, jo vull deixar de pagar
		- variant: no se que farà el nou llogater pero vull deslligar-me d'aquest contracte
	- Segons quan es digui
		- variant: a data fixa amb lectura
		- variant: quan toqui, ja farem comptes
- Entro en un pis de lloguer, que estava abans amb SomEnergia i vull posar-ho al meu nom
- Sóc el propietari d'un pis de lloguer, el llogueter ha marxat i ho tenia amb SomEnergia i vull posar-ho al meu nom, mentres no vingui el nou

## No escenaris

Escenaris que hem decidit no cobrir:

- Sóc soci de Som i vull fer un contracte pero no en el meu nom sino en el d'una persona propera (que viu amb mi)
	- Ho ha de fer la persona titular
	- Perdem la validació del contracte que aporta fer-ho des de l'oficina virtual
	- Si ho fan es cosa seva, pero no des de l'oficina virtual on consta que qui ho fa es l'usuari registrat
- Sóc un administrador de finques, el llogater tenia la llum amb Som Energia i vull posar-la al nom del propietari
	- Si ho fan es cosa seva, a les condicions es comprometen a que la persona titular es qui omple i acepta


# Casos d'ús


## Canvi titular iniciativa antic titular

- Antic titular envia token des de la OV
    - Seleccionar contracte
    - Nom i cognoms
    - Correu del nou
    - Telefon del nou
    - "Com abans millor" o "data i lectura"
- S'envia correu a antic
    - Hem enviat el token
    - en 15 dies si no omple el formulari farem un tall
- S'enviar correu al nou
    - Per procedir omple el formulari
    - en 15 dies si no omple el formulari farem un tall
- Formulari del token pel nou
    - Mostrar dades punt subministrament
    - Mostrar data i lectura
    - Dades personals de la persona o login ov depenent del DNI
    - Dades de pagament
    - Acceptar condicions generals
- Alta ov
    - enviament de contrasenya
- Enviament de contracte
- Notificacio al sortint
- Seguiment normal cas ATR

TODO: Si el nou titular no es soci. El forcem fer-se soci? Com el poden convidar i alhora fer servir el canvi?

## Contractacio sense haver fet login (inclou canvi de titular per iniciativa del nou)

- Demanar el nif
    - Cas no es soci ni titular
        - Demanar les dades
        - Demanar si es vol fer, si no, dir-li el que hi ha i frenar (o segons el que decideixi l'assemblea)
    - Cas es titular no soci
        - Cal demanar la password
        - Demanar si es vol fer, si no, dir-li el que hi ha i frenar (o segons el que decideixi l'assemblea)
    - Cas es soci
        - Cal demanar la password
- Demanem el CUPS
    - Cas la tenim (actiu o no)
        - Presentem dades del punt TODO: Ho podem fer?
        - Cas Contracte actiu (Es un canvi de titular!)
            - No pedir potencia
            - Sabemos que es un cambio titular
            - Hay que pedir: Surrogacion?
        - Cas no contracte actiu
            - Hay que pedir: alta? cambio titular (si no alta)? cambio pot/tar (si no alta)? surrogacion (si cambio titular)?
    - Cas no la tenim
        - Demanem dades del punt
        - Hay que pedir: alta? cambio titular (si no alta)? cambio pot/tar (si no alta)? surrogacion (si cambio titular)?
- Demanem dades de pagament

## Contractacio logejat a l'oficina virtual

- Si no soc soci:
    - Et fas?
- Demanem el CUPS
    - Cas la tenim 
        - Presentem dades del punt
    - Depenent de si es a Som, ha estat o no, fem
        - Demanem dades del punt
- Hay que pedir: alta? cambio titular? cambio pot/tar? surrogacion (si cambio titular)?
- Dades de pagament
    - Ara, dintre de la OV podriem donar a escollir els comptes que ja te

## Contractacio amb invitacio

- Igual que contracte sense login
- Nomes que el soci fadri no ha de coincidir amb el titular

## Contractacio per intercoop

- Es presenta info del soci intercoop
    - Dades del titular presses del soci intercoop
    - posibilitat d'edicio? (menys el nif)
- No obligues a fer-se soci
- Dades de pagament
- Acceptar condicions generals

## Inclusions

Detalls de passes referides en els casos anteriors:

- Dades personals
	- TODO: Que fer amb persona juridica?
	- TODO: Quines dades
- Dades de pagament
	- IBAN
	- Que no ets tu el titular?
		- Si no, omple les dades
	- Acepto mandat SEPA
- Hay luz? (alta?)
	- No preguntar si el CUPS está activo, pues es seguro un contrato dado de alta
- Cambia el titular?
	- No preguntar si es una alta (es A3)
	- No preguntar si es un CUPS activo en SomEnergia (la respuesta seria si)
- Cambia potencia o tipo de acceso?
	- No preguntar si es una alta
	- de momento no damos la opcion
- Que tarifa y potencia?
	- Solo en caso de alta o si se ha indicado que se quiere hacer
	- Es decideix no preguntar-ho pels C1 i C2-administratius, es posa un inventat
- Estas de acuerdo en surrogar?
	- solo si hay un cambio de titular
	- Hay que plantear los costes y riesgos de cada opcion
		- Si surroga, acepta las deudas acumuladas
		- Si no, tiene que pagar deposito de garantia
	- pendiente de confirmar si damos esta opcion o no


# Fuerzas, urgencias y prioridades

- Muerte al pagador es un requisito legal y para poder gestionar el aluvion de canvios de titular que comporta, dicha gestion ha de estar automatizada.
- MesOpcions lleva meses con su parte de integracion en Intercoop hecha y nosotros no hemos respondido
- Energetica esta pasando los contratos a mano en nuestro formulario
- Objetivos TEET Integracion de la contratacion dentro de la oficina virtual



# Apuns discusions previes

## Novetats i simplificacions

- Introduirem varies coses noves:
	- Caldrà signar els contractes amb garanties
	- Un formulari pot començar des de un altre lloc des d'on ja ens passen informació
		- Desde l'OV, i ens passen el soci de Som (nou contracte o invitació)
		- Desde entitat intercooperadora, ens envien les dades personals del soci d'intercooperació
	- Quan ja tenim un NIF o un CUPS al sistema:
		- Permet simplificar les dades que demanem
		- Evitem dues versions de la mateixa cosa amb errors tipogràfics
		- Evitem suplantacións no controlades
.

- No cal preguntar per tarifa i potencia si es un Cn
	- ens estalvia arreglar els problemes que dona la part del formulari on pots escriure la potencia lliurement
	- es manté la potencia que apareix al contracte actual
	- ens arriba de la distri en els següents passos
	- Cn no administratius necessitaran potencia
		- pero sera la part que fem servir per A1 que limita a potencies normalitzades

.

- Quan escollim soci:
	- Pot vindre de token
		- Soci d'intercooperació (serà el soci concret, no pas l'entitat intercooperadora)
			- Ens estalviem preguntar dades
			- Poden faltar dades, presentem formulari mig ple?
			- Forcem el soci d'intercooperació com a titular?
		- Invitació: Soci de som
			- Hem de treure el soci com a opcio pel titular
			- Cal demanar dades
		- Contractació des de l'oficina virtual
			- Opcio que tindràn els socis a la OV
			- Ho han de poder fer els titulars no socis?
			- Ens ve ja el soci donat
			- Capar el titular a que només sigui el soci? (No, oi?)
		- Promocions?
	- Soci nou o soci existent?
		- Soci nou, demanar dades personals
			- pot existir com a titular
		- Soci existent (sense token?) 

.

- Quan demanem dades personals:
	- demanem primer el dni
	- si ja existeix, agafes noms i cognoms, en comptes de demanar les dades
		- s'eviten adreces duplicadesa
		- notifiquem que ja existeix al sistema
		- Avis:
			- Ja tenim el NIF
			- Donar opcions per rescatar (suplantacio, correu canviat...)
			- Notifiquem per correu?
			- Demanem password OV?
		- LOPD: Podem mostrar el nom sense assegurar qui és
	- si no existeix, demanes les dades
	- si es juridica o fisica, adaptem el formulari, treient el cognom i afegint dades de representant
	- encara que existeixi si es juridica demanar persona que ho fa en el seu nom (el representant es per cada gestio)
	- acceptacio tractament, com ho fem més garantista sense complicar gaire?

.

- Posar al començament les preguntes:
	- Actualment hi ha llum al punt de subministrament
		- No, vull donar d'alta el subministrament
		- Si, vull cambiar la comercialitzadora a SomEnergia  i/o persona titular
	- Si? Es manté la persona titular del contracte
		- Si, només vull canviar la companyia comercialitzadora
		- No, vull canviar la companyia i també el titular
	- La companyia es SomEnergia? (canvi titular) <- Ho fem aixi?

.

- Si el CUPS ja existeix...
	- Estalviem ficar les dades?
	- Si esta actiu, es un canvi de titular?



## Condiciones generales

- No hay termino
- Pero hay cosas que hay que cambiar
- Comunicacion a clientes con plazo para rescindir
- Para 2.x basta con validar un correo
- Para 3.x millor si tenim més mitjans de prova

## Proteccio de dades

- Termini 25 Maig
- 12 Maig auditoria
- 28 Maig enviem als clients
	- Aixo podem fer aceptacio tacita de les CG
- Proteccio de dades
	- Acceptacio massiva
		- Integracio
		- Es pot integrar tots els contractes amb una sola acceptació
	- Nous
		- Canviar el text
		- De entrada com estem



# Canvis de titular

- Cal el consentiment d'ambdos
- Comenca el nou
	- S'envia un mail a l'actual
	- Consentiment tacit
	- Si arriba tard, podemos hacer un nuevo M1
	- Introduce complicaciones, mejor no
- Comenca el actual
	- S'envia una invitacio al nou
	- Si s'omple es fa
	- Si no contesta en plaç, baixa del contrato
- Aclarir que passa quan no hi ha els consentiments explicits
	- Sembla que a la practica no cal consentiment del sortint

- S'afegira a  les condicions de contracte el tacit en 15 dies si el nou contracta
- A qui ho demana se li avisa de que pot trigar 15 dies
- Quan s'acepti abans cal activar automaticament

# Canvis de titular, com operem backend

- Distibuidora te dos modes
	- Com abans millor
	- A cicle de facturació
- No ens val la pena a cicle perque tampoc ens passen lectures
- 
	- Es crea el nou titular
	- Si hi ha facturacio endarrerida, l'M101 es marca com a pendent de validar


- Com facturem la transicio
	- Marcar com a 'facturació suspesa' (no pas treure'l de lot)
	- com abans milor


# Surrogar o no

- Quan hi ha un canvi de titular (con o sense canvi de comer), ho fem per surrogació
- Quan hi ha deutes millor no surrogar
	- No sempre ho detectem
- TODO: Cal buscar el métode que mantingui la gestió simple en la majoria dels casos




