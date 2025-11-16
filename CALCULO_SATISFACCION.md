# 📊 Cálculo de % Satisfacción - Documentación

## 🎯 **¿Qué es el % Satisfacción?**

El **% Satisfacción** es una métrica que indica qué porcentaje de las respuestas a una pregunta fueron **positivas** (calificaciones 4 y 5 en escala Likert 1-5).

---

## 🧮 **Fórmula de Cálculo**

```typescript
% Satisfacción = ((Respuestas_4 + Respuestas_5) / Total_Respuestas) × 100
```

### **Ejemplo Práctico:**

#### **Caso 1: Pregunta con respuestas mixtas**
```
Pregunta: "El docente explica con claridad"
C1 (Muy malo): 2 respuestas
C2 (Malo): 3 respuestas  
C3 (Regular): 5 respuestas
C4 (Bueno): 12 respuestas ← Satisfactoria
C5 (Excelente): 8 respuestas ← Satisfactoria

Total = 2 + 3 + 5 + 12 + 8 = 30 respuestas
Satisfactorias = 12 + 8 = 20 respuestas
% Satisfacción = (20 / 30) × 100 = 66.7%
```

#### **Caso 2: Todas las respuestas son "3" (Regular)**
```
Pregunta: "El docente fomenta la participación"
C1: 0 respuestas
C2: 0 respuestas
C3: 3 respuestas ← Todas son "Regular"
C4: 0 respuestas
C5: 0 respuestas

Total = 3 respuestas
Satisfactorias = 0 + 0 = 0 respuestas
% Satisfacción = (0 / 3) × 100 = 0.0%
```

---

## 🎨 **Colores Semáforo en Excel**

### **🟢 Verde (Excelente): ≥ 80%**
- **Color de fondo**: `#C6EFCE` (verde claro)
- **Color de texto**: `#006100` (verde oscuro)
- **Significado**: La mayoría de estudiantes están satisfechos

### **🟡 Amarillo (Bueno): 60% - 79%**
- **Color de fondo**: `#FFEB9C` (amarillo claro)
- **Color de texto**: `#9C6500` (amarillo oscuro)
- **Significado**: Nivel aceptable, pero hay margen de mejora

### **🔴 Rojo (Crítico): < 60%**
- **Color de fondo**: `#FFC7CE` (rojo claro)
- **Color de texto**: `#9C0006` (rojo oscuro)
- **Significado**: Requiere atención inmediata

---

## 📋 **Interpretación de Resultados**

### **% Satisfacción = 0%**
```
✅ Correcto cuando:
- Todas las respuestas son 1, 2 o 3
- No hay respuestas 4 o 5
- Ejemplo: 3 respuestas con valor "3" = 0% satisfacción
```

### **% Satisfacción = 100%**
```
✅ Correcto cuando:
- Todas las respuestas son 4 o 5
- No hay respuestas 1, 2 o 3
- Ejemplo: 10 respuestas con valor "5" = 100% satisfacción
```

### **% Satisfacción = 50%**
```
✅ Correcto cuando:
- La mitad de respuestas son 4-5
- La otra mitad son 1-3
- Ejemplo: 5 respuestas "5" + 5 respuestas "2" = 50% satisfacción
```

---

## 🔍 **Debugging en Consola**

El sistema muestra en la consola del navegador el cálculo detallado:

```javascript
console.log(`Pregunta Q1.1: C1=0, C2=0, C3=3, C4=0, C5=0, Total=3, Satisfactorias=0, %=0.0`);
console.log(`Pregunta Q1.2: C1=1, C2=2, C3=5, C4=8, C5=4, Total=20, Satisfactorias=12, %=60.0`);
```

---

## 📊 **Casos de Uso Administrativos**

### **Para Coordinadores Académicos:**
- **🟢 ≥ 80%**: Docente excelente, usar como referencia
- **🟡 60-79%**: Docente competente, seguimiento normal
- **🔴 < 60%**: Docente requiere plan de mejoramiento

### **Para Análisis Institucional:**
- **Identificar preguntas críticas** (muchas rojas)
- **Comparar entre secciones** del mismo programa
- **Tendencias temporales** (mejora/deterioro)
- **Benchmarking** entre docentes

### **Para Planes de Mejoramiento:**
- **Priorizar intervenciones** en preguntas con % bajo
- **Reconocer fortalezas** en preguntas con % alto
- **Asignar recursos** según criticidad (colores)

---

## 🎯 **Validación del Cálculo**

### **Verificación Manual:**
```
1. Sumar C4 + C5 = Respuestas satisfactorias
2. Sumar C1 + C2 + C3 + C4 + C5 = Total respuestas
3. Dividir: Satisfactorias / Total
4. Multiplicar por 100 para obtener porcentaje
5. Redondear a 1 decimal
```

### **Casos Edge:**
- **Sin respuestas**: % = 0.0%
- **Solo respuestas 3**: % = 0.0% ✅ Correcto
- **Solo respuestas 4-5**: % = 100.0%
- **Respuestas mixtas**: % calculado proporcionalmente

---

## ✅ **Estado: Implementado y Funcionando**

- ✅ **Cálculo correcto**: Solo 4 y 5 son satisfactorias
- ✅ **Colores automáticos**: Estilos inline para Excel
- ✅ **Debugging**: Console.log para verificación
- ✅ **Casos edge**: Maneja 0% correctamente
- ✅ **Formato profesional**: Colores semáforo visibles

**¡El cálculo de satisfacción ahora es preciso y los colores se muestran correctamente en Excel!** 🎉
