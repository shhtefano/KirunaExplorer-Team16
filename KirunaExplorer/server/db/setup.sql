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

-- Associazioni documenti e stakeholder
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (1, 1);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (2, 2);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (3, 3);
INSERT INTO Document_Stakeholder (stakeholder_id, document_id) VALUES (2, 4);

INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 1);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 2);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 3);
