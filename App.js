import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TextInput,
  Pressable, StyleSheet, Alert, Platform
} from "react-native";

const formInicial = {
  fecha: "", hora: "", farmaceutico: "", paciente: "", edad: "", sexo: "",
  consultaPara: "", peso: "", embarazo: "", motivo: "", duracion: "",
  intensidad: "", evolucion: "", accionesPrevias: "", alarma: [],
  alergias: "", adherencia: [], comorbilidades: [], habitos: [],
  medicamentos: "", problemasMedicamentos: [], decision: [],
  recomendacion: "", dosisUso: "", senalesConsulta: "",
  seguimiento: "", consentimiento: "", registroRealizado: "", firma: ""
};

const criteriosAlarma = [
  "Síntoma severo/progresivo", "Dolor torácico/disnea/síncope",
  "Sangrado/deshidratación", "Fiebre alta/persistente",
  "Déficit neurológico", "Embarazo/lactancia",
  "Menor pequeño/adulto mayor frágil", "Inmunosupresión",
  "Comorbilidad descompensada", "Sospecha RAM/interacción",
  "Duración excesiva/recurrencia", "Necesita diagnóstico/receta"
];

const adherenciaOpciones = ["Olvidos", "Duplicidad", "Suspendió", "Nuevo fármaco", "No aplica"];
const comorbilidadOpciones = ["HTA", "Diabetes", "Renal", "Hepática", "Cardiaca", "Asma/EPOC", "Úlcera/hemorragia", "Anticoagulado", "Inmunosupresión"];
const habitosOpciones = ["Alcohol", "Tabaco", "Dieta", "Actividad física", "Exposición laboral"];
const problemasOpciones = ["Duplicidad", "RAM", "Interacción", "Contraindicación", "No sabe usar"];
const decisionesOpciones = ["Medidas no farmacológicas", "Medicamento permitido", "Derivación médica/urgencia", "Seguimiento/SFT", "Farmacovigilancia"];

export default function App() {
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState(formInicial);
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  function actualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function toggle(campo, valor) {
    const lista = form[campo] || [];
    const nuevaLista = lista.includes(valor)
      ? lista.filter((x) => x !== valor)
      : [...lista, valor];
    setForm({ ...form, [campo]: nuevaLista });
  }

  function guardar() {
    if (editandoId) {
      setRegistros(registros.map((r) =>
        r.id === editandoId ? { ...r, ...form, editado: new Date().toLocaleString() } : r
      ));
      setEditandoId(null);
      setForm(formInicial);
      return;
    }

    const nuevo = {
      id: Date.now().toString(),
      creado: new Date().toLocaleString(),
      ...form
    };

    setRegistros([nuevo, ...registros]);
    setForm(formInicial);
  }

  function editar(r) {
    setEditandoId(r.id);
    setForm({ ...formInicial, ...r });
  }

  function eliminar(id) {
    setRegistros(registros.filter((r) => r.id !== id));
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(formInicial);
  }

  function texto(v) {
    return Array.isArray(v) ? v.join(", ") : String(v || "");
  }

  function limpiar(v) {
    return texto(v).replace(/"/g, '""');
  }

  function descargarArchivo(contenido, nombre, tipo) {
    if (Platform.OS === "web") {
      const blob = new Blob([contenido], { type: tipo });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombre;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  function validar() {
    if (registros.length === 0) {
      Alert.alert("Sin registros", "Primero guarda al menos un registro.");
      return false;
    }
    return true;
  }

  function exportarCSV() {
    if (!validar()) return;

    const campos = Object.keys(formInicial);
    const csv = [
      ["Creado", ...campos].map((x) => `"${x}"`).join(","),
      ...registros.map((r) =>
        [r.creado, ...campos.map((c) => r[c])]
          .map((x) => `"${limpiar(x)}"`)
          .join(",")
      )
    ].join("\n");

    descargarArchivo(csv, "registros_pharmacare.csv", "text/csv;charset=utf-8;");
  }

  function generarHTML() {
    return `
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial; padding: 32px; color: #111827; }
          h1 { color: #0f766e; }
          .registro { border: 1px solid #ccc; padding: 18px; margin-bottom: 18px; border-radius: 12px; }
          .campo { margin-bottom: 7px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Pharmacare</h1>
        <h2>Entrevista clínica ultrabreve de atención farmacéutica</h2>
        ${registros.map(r => `
          <div class="registro">
            ${Object.keys(formInicial).map(c => `
              <div class="campo"><span class="label">${c}:</span> ${texto(r[c])}</div>
            `).join("")}
          </div>
        `).join("")}
      </body>
      </html>
    `;
  }

  function exportarPDF() {
    if (!validar()) return;
    const win = window.open("", "_blank");
    win.document.write(generarHTML() + "<script>window.onload=function(){window.print();}</script>");
    win.document.close();
  }

  function exportarWord() {
    if (!validar()) return;
    descargarArchivo(generarHTML(), "registros_pharmacare.doc", "application/msword;charset=utf-8;");
  }

  const filtrados = registros.filter((r) =>
    `${r.paciente} ${r.motivo} ${r.decision}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Text style={styles.logo}>💊</Text>
          <Text style={styles.title}>Pharmacare</Text>
          <Text style={styles.subtitle}>Atención farmacéutica comunitaria</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{registros.length}</Text>
          <Text style={styles.statsLabel}>registros guardados</Text>
        </View>

        {editandoId && (
          <View style={styles.editNotice}>
            <Text style={styles.editText}>Modo edición activo</Text>
          </View>
        )}

        <Section title="1. Identificación rápida">
          <Input label="Fecha" value={form.fecha} onChangeText={(v) => actualizar("fecha", v)} />
          <Input label="Hora" value={form.hora} onChangeText={(v) => actualizar("hora", v)} />
          <Input label="Farmacéutico" value={form.farmaceutico} onChangeText={(v) => actualizar("farmaceutico", v)} />
          <Input label="Paciente" value={form.paciente} onChangeText={(v) => actualizar("paciente", v)} />
          <Input label="Edad" value={form.edad} onChangeText={(v) => actualizar("edad", v)} />
          <Input label="Sexo" value={form.sexo} onChangeText={(v) => actualizar("sexo", v)} />
          <Input label="Consulta para: paciente/cuidador" value={form.consultaPara} onChangeText={(v) => actualizar("consultaPara", v)} />
          <Input label="Peso si niño/a" value={form.peso} onChangeText={(v) => actualizar("peso", v)} />
          <Input label="Embarazo/lactancia: Sí/No/No sabe" value={form.embarazo} onChangeText={(v) => actualizar("embarazo", v)} />
        </Section>

        <Section title="2. Motivo de consulta">
          <Input label="Motivo principal / síntoma" value={form.motivo} onChangeText={(v) => actualizar("motivo", v)} />
          <Input label="Inicio y duración" value={form.duracion} onChangeText={(v) => actualizar("duracion", v)} />
          <Input label="Intensidad: leve/moderada/severa" value={form.intensidad} onChangeText={(v) => actualizar("intensidad", v)} />
          <Input label="Evolución: mejora/igual/empeora" value={form.evolucion} onChangeText={(v) => actualizar("evolucion", v)} />
          <Input label="Acciones previas" value={form.accionesPrevias} onChangeText={(v) => actualizar("accionesPrevias", v)} />
        </Section>

        <Section title="3. Criterios de alarma / derivación">
          {criteriosAlarma.map((x) => (
            <Check key={x} label={x} checked={form.alarma.includes(x)} onPress={() => toggle("alarma", x)} />
          ))}
        </Section>

        <Section title="4. Medicación, comorbilidades y riesgos">
          <Input label="Alergias / RAM previas" value={form.alergias} onChangeText={(v) => actualizar("alergias", v)} />
          <CheckGroup title="Adherencia / cambios recientes" items={adherenciaOpciones} field="adherencia" form={form} toggle={toggle} />
          <CheckGroup title="Comorbilidades" items={comorbilidadOpciones} field="comorbilidades" form={form} toggle={toggle} />
          <CheckGroup title="Hábitos relevantes" items={habitosOpciones} field="habitos" form={form} toggle={toggle} />
        </Section>

        <Section title="5. Medicamentos / productos">
          <Input label="Medicamento/producto, dosis, frecuencia, vía e indicación" value={form.medicamentos} onChangeText={(v) => actualizar("medicamentos", v)} />
          <CheckGroup title="Problemas detectados" items={problemasOpciones} field="problemasMedicamentos" form={form} toggle={toggle} />
        </Section>

        <Section title="6. Decisión farmacéutica">
          <CheckGroup title="Resultado" items={decisionesOpciones} field="decision" form={form} toggle={toggle} />
          <Input label="Recomendación" value={form.recomendacion} onChangeText={(v) => actualizar("recomendacion", v)} />
          <Input label="Dosis / uso / duración máxima" value={form.dosisUso} onChangeText={(v) => actualizar("dosisUso", v)} />
          <Input label="Señales para consultar o volver" value={form.senalesConsulta} onChangeText={(v) => actualizar("senalesConsulta", v)} />
        </Section>

        <Section title="7. Seguimiento y registro">
          <Input label="Seguimiento: 24-48 h / 72 h / 7 días / no aplica" value={form.seguimiento} onChangeText={(v) => actualizar("seguimiento", v)} />
          <Input label="Consentimiento verbal: Sí/No" value={form.consentimiento} onChangeText={(v) => actualizar("consentimiento", v)} />
          <Input label="Registro realizado: Sí/No" value={form.registroRealizado} onChangeText={(v) => actualizar("registroRealizado", v)} />
          <Input label="Firma / iniciales" value={form.firma} onChangeText={(v) => actualizar("firma", v)} />
        </Section>

        <Pressable style={styles.saveButton} onPress={guardar}>
          <Text style={styles.saveButtonText}>{editandoId ? "Guardar cambios" : "Guardar registro"}</Text>
        </Pressable>

        {editandoId && (
          <Pressable style={styles.cancelButton} onPress={cancelarEdicion}>
            <Text style={styles.cancelText}>Cancelar edición</Text>
          </Pressable>
        )}

        <Text style={styles.blockTitle}>Exportaciones</Text>
        <View style={styles.exportGrid}>
          <ExportButton icon="📊" text="Excel/CSV" onPress={exportarCSV} />
          <ExportButton icon="📄" text="PDF" onPress={exportarPDF} />
          <ExportButton icon="📝" text="Word" onPress={exportarWord} />
        </View>

        <Text style={styles.blockTitle}>Buscar</Text>
        <TextInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar paciente, motivo o decisión" style={styles.search} />

        <Text style={styles.blockTitle}>Historial</Text>
        {filtrados.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.empty}>No hay registros.</Text></View>
        ) : (
          filtrados.map((r) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardTitle}>{r.paciente || "Sin nombre"}</Text>
              <Text style={styles.cardText}>Creado: {r.creado}</Text>
              <Text style={styles.cardText}>Motivo: {r.motivo}</Text>
              <Text style={styles.cardText}>Decisión: {texto(r.decision)}</Text>
              <View style={styles.cardActions}>
                <Pressable style={styles.editButton} onPress={() => editar(r)}><Text style={styles.actionText}>Editar</Text></Pressable>
                <Pressable style={styles.deleteButton} onPress={() => eliminar(r.id)}><Text style={styles.actionText}>Eliminar</Text></Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function Input({ label, value, onChangeText }) {
  return (
    <View style={styles.inputBox}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={label} style={styles.input} multiline />
    </View>
  );
}

function Check({ label, checked, onPress }) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress}>
      <Text style={styles.checkBox}>{checked ? "☑" : "☐"}</Text>
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}

function CheckGroup({ title, items, field, form, toggle }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {items.map((x) => (
        <Check key={x} label={x} checked={(form[field] || []).includes(x)} onPress={() => toggle(field, x)} />
      ))}
    </View>
  );
}

function ExportButton({ icon, text, onPress }) {
  return (
    <Pressable style={styles.exportCard} onPress={onPress}>
      <Text style={styles.exportIcon}>{icon}</Text>
      <Text style={styles.exportText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e8f3f1" },
  content: { padding: 18, paddingBottom: 40 },
  header: { backgroundColor: "#0f766e", borderRadius: 26, padding: 24, marginBottom: 16 },
  logo: { fontSize: 34 },
  title: { fontSize: 36, fontWeight: "900", color: "white" },
  subtitle: { fontSize: 16, color: "#ccfbf1" },
  statsCard: { backgroundColor: "white", borderRadius: 20, padding: 18, marginBottom: 16, flexDirection: "row", alignItems: "baseline" },
  statsNumber: { fontSize: 34, fontWeight: "900", color: "#0f766e", marginRight: 10 },
  statsLabel: { fontSize: 16, color: "#475569" },
  editNotice: { backgroundColor: "#fff7ed", borderRadius: 16, padding: 14, marginBottom: 14 },
  editText: { color: "#c2410c", fontWeight: "900" },
  section: { backgroundColor: "white", borderRadius: 22, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontWeight: "900", color: "#0f172a", marginBottom: 12 },
  inputBox: { marginBottom: 12 },
  label: { fontWeight: "700", marginBottom: 6, color: "#334155" },
  input: { backgroundColor: "#f8fafc", borderColor: "#dbe4e8", borderWidth: 1, borderRadius: 14, padding: 12, minHeight: 46, fontSize: 16 },
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7 },
  checkBox: { fontSize: 22, marginRight: 8, color: "#0f766e" },
  checkText: { fontSize: 15, color: "#334155", flex: 1 },
  group: { marginTop: 6, marginBottom: 10 },
  groupTitle: { fontWeight: "900", color: "#0f766e", marginBottom: 5 },
  saveButton: { backgroundColor: "#0f766e", borderRadius: 18, padding: 17, alignItems: "center", marginTop: 4, marginBottom: 10 },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "900" },
  cancelButton: { backgroundColor: "#64748b", borderRadius: 18, padding: 15, alignItems: "center", marginBottom: 18 },
  cancelText: { color: "white", fontWeight: "900", fontSize: 16 },
  blockTitle: { fontSize: 23, fontWeight: "900", marginBottom: 10, color: "#0f172a" },
  exportGrid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  exportCard: { flex: 1, backgroundColor: "white", borderRadius: 18, padding: 14, alignItems: "center" },
  exportIcon: { fontSize: 28, marginBottom: 6 },
  exportText: { fontWeight: "800", color: "#0f172a", textAlign: "center" },
  search: { backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 20, fontSize: 16 },
  emptyCard: { backgroundColor: "white", borderRadius: 18, padding: 16 },
  empty: { color: "#64748b" },
  card: { backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 10 },
  cardTitle: { fontSize: 19, fontWeight: "900", color: "#0f766e", marginBottom: 4 },
  cardText: { color: "#334155", marginBottom: 2 },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  editButton: { flex: 1, backgroundColor: "#2563eb", padding: 12, borderRadius: 12, alignItems: "center" },
  deleteButton: { flex: 1, backgroundColor: "#dc2626", padding: 12, borderRadius: 12, alignItems: "center" },
  actionText: { color: "white", fontWeight: "900" }
});