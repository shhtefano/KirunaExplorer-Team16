-- Eliminazione tabelle esistenti
DROP TABLE IF EXISTS Attachments;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS Geolocation;
DROP TABLE IF EXISTS Documents;
DROP TABLE IF EXISTS Geolocation_Documents;
DROP TABLE IF EXISTS OriginalResources;
DROP TABLE IF EXISTS Stakeholders;
DROP TABLE IF EXISTS Document_Stakeholder;
DROP TABLE IF EXISTS DocumentTypes;
DROP TABLE IF EXISTS Type;

-- Creazione delle tabelle
CREATE TABLE "Connections" (
	"parent_id"	INTEGER,
	"children_id"	INTEGER,
	"connection_type"	VARCHAR(50),
	PRIMARY KEY("parent_id","children_id", "connection_type"),
	FOREIGN KEY("parent_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("children_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("parent_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE,
	FOREIGN KEY("children_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Document_Stakeholder" (
	"stakeholder_id"	INTEGER NOT NULL,
	"document_id"	INTEGER NOT NULL,
	"id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("stakeholder_id") REFERENCES "Stakeholders"("stakeholder_id"),
	UNIQUE("document_id","stakeholder_id")
);

CREATE TABLE "Documents" (
	"document_id"	INTEGER,
	"document_title"	VARCHAR(255) NOT NULL,
	"scale"	VARCHAR(50) NOT NULL,
	"issuance_date"	DATE NOT NULL,
	"language"	VARCHAR(50),
	"pages"	INT,
	"document_type"	VARCHAR(50) NOT NULL,
	"document_description"	TEXT NOT NULL,
	PRIMARY KEY("document_id" AUTOINCREMENT)
);

CREATE TABLE "Geolocation" (
	"area_id"	INTEGER NOT NULL,
	"long"	REAL NOT NULL,
	"lat"	REAL NOT NULL,
	"n_order" INTEGER NOT NULL DEFAULT 0,
	"sub_area_id" INTEGER,
	"area_name"	TEXT NOT NULL DEFAULT ' '
);

CREATE TABLE "Geolocation_Documents" (
	"area_id"	INTEGER NOT NULL,
	"document_id"	INTEGER NOT NULL,
	PRIMARY KEY("area_id","document_id"),
	FOREIGN KEY("area_id") REFERENCES "Geolocation"("area_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Stakeholders" (
	"stakeholder_id"	INTEGER,
	"stakeholder_name"	TEXT NOT NULL,
	PRIMARY KEY("stakeholder_id" AUTOINCREMENT)
);

CREATE TABLE "Type" (
	"type_id"	INTEGER,
	"type_name"	VARCHAR(50) NOT NULL,
	PRIMARY KEY("type_id" AUTOINCREMENT)
);

-- Popolamento tabelle
INSERT INTO Stakeholders(stakeholder_name) VALUES ('Kiruna kommun/Residents');
INSERT INTO Stakeholders(stakeholder_name) VALUES ('LKAB');
INSERT INTO Stakeholders(stakeholder_name) VALUES ('Kiruna kommun');
INSERT INTO Stakeholders(stakeholder_name) VALUES ('White Arkitekter');

INSERT INTO Type (type_name) VALUES ('Informative');
INSERT INTO Type (type_name) VALUES ('Prescriptive');
INSERT INTO Type (type_name) VALUES ('Design');
INSERT INTO Type (type_name) VALUES ('Technical');
INSERT INTO Type (type_name) VALUES ('Material Effects');


INSERT INTO Documents (document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES('Town Hall demolition (64)', 'blueprints/effects', '2019/04', '','', 'Material Effects', 'After the construction of the new town hall wascompleted, the old building, nicknamed "The Igloo,"was demolished. The only elements preserved werethe door handles, a masterpiece of Sami art made ofwood and bone, and the clock tower, which oncestood on the roof of the old town hall. The clocktower was relocated to the central square of NewKiruna, in front of the new building.');

INSERT INTO Documents (document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES
('Development Plan (41)', '1 : 7,500', '2014/03/17', 'Swedish', 111, 'Design', 'The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.');

INSERT INTO Documents (document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES
('Deformation forecast (45)', '1 : 12,000', '2014/12/01', 'Swedish', 1, 'Technical', 'The deformation forecast predicts the development of deformations affecting the urban area of Kiruna. The report includes visual aids and detailed technical descriptions of geological impacts and the measures to counteract them.');

INSERT INTO Documents (document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES
('Adjusted development plan (47)', '1 : 7,500', '2015', 'Swedish', 1, 'Design', 'This document is the update of the Development
Plan, one year after its creation, modifications are
made to the general master plan, which is published under the name "Adjusted Development
Plan91," and still represents the version used today
after 10 years. Certainly, there are no drastic differences compared to the previous plan, but upon careful
comparison, several modified elements stand out.
For example, the central square now takes its final
shape, as well as the large school complex just north
of it, which appears for the first time.');



-- Associazioni documenti e stakeholder
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (1, 1);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (2, 2);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (3, 3);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (2, 4); -- Adjusted development plan


-- Adjusted development plan (47)
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (3, 4);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (4, 4);

-- Custom area for Adjusted development plan (47)
WITH coordinates (long, lat, n_order) AS (
    VALUES 
        (20.2787017822266, 67.8589686452163, 1),
        (20.2780151367188, 67.8582893476797, 2),
        (20.2769422531128, 67.8578041230353, 3),
        (20.2753114700317, 67.857189490655, 4),
        (20.2742385864258, 67.8565101412781, 5),
        (20.2735090255737, 67.8557498935059, 6),
        (20.2735090255737, 67.8549410920676, 7),
        (20.2745819091797, 67.8537763687093, 8),
        (20.2758693695068, 67.852886610283, 9),
        (20.2767276763916, 67.8521262443632, 10),
        (20.2776288986206, 67.8516085342318, 11),
        (20.2779293060303, 67.8510746336219, 12),
        (20.2781009674072, 67.850653976048, 13),
        (20.2781867980957, 67.8501362332338, 14),
        (20.2771139144897, 67.8484858513083, 15),
        (20.2806329727173, 67.8482107763005, 16),
        (20.2836799621582, 67.8481622333154, 17),
        (20.2875852584839, 67.8482107763005, 18),
        (20.2938079833984, 67.8482916810513, 19),
        (20.3030776977539, 67.8482593191847, 20),
        (20.3094291687012, 67.8481139541549, 21),
        (20.3132915496826, 67.8478874184196, 22),
        (20.3156089782715, 67.847725605833, 23),
        (20.3180122375488, 67.8479845054327, 24),
        (20.3165531158447, 67.848469934437, 25),
        (20.31569480896, 67.8490200750961, 26),
        (20.3145790100098, 67.8501850360131, 27),
        (20.3129482269287, 67.85151172619, 28),
        (20.3105449676514, 67.8526765626596, 29),
        (20.3073692321777, 67.8537119240126, 30),
        (20.3033351898193, 67.8548442978592, 31),
        (20.3001594543457, 67.8556531026549, 32),
        (20.2957820892334, 67.8562030738914, 33),
        (20.2889156341553, 67.8573029774485, 34),
        (20.2844524383545, 67.8581440451589, 35)
)
INSERT INTO Geolocation (area_id, long, lat, n_order, sub_area_id, area_name)
SELECT 2, long, lat, n_order, NULL, 'Adjusted development plan'
FROM coordinates;



-- Kiruna Map
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 1);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 2);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 3);
-- Adjusted development plan
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(2, 4);
-- Kiruna church closes
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(4, 5);
