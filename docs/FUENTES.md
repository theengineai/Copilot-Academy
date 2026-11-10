# Fuentes y verificación del contenido

Contenido contrastado el **10 de noviembre de 2026** con la documentación de Microsoft y con anuncios recientes. Copilot cambia con frecuencia y **sus funciones dependen de la licencia, la región y la configuración de cada organización**: revisa estas páginas antes de cada edición del temario.

| Fuente | Qué se ha contrastado | Dónde se usa |
|---|---|---|
| [Get started writing prompts in Microsoft 365 Copilot](https://support.microsoft.com/microsoft-365-copilot/get-started-writing-prompts-in-microsoft-365-copilot) | Cuatro elementos: objetivo, contexto, expectativas y fuente; solo el objetivo es imprescindible | M2, medidor del simulador |
| [Refer to specific files and more in Microsoft 365 Copilot](https://support.microsoft.com/microsoft-365-copilot/refer-to-specific-files-and-more-in-microsoft-365-copilot) | `/` para referenciar archivos, personas, reuniones y correos | M1, M2, simulador |
| [Understand Microsoft 365 Copilot Chat](https://learn.microsoft.com/training/modules/get-started-microsoft-365-copilot-business-chat/2-understand-microsoft-365-copilot-chat) | Copilot Chat (web) frente a la licencia (Trabajo y Web); selector Trabajo/Web (en algunas versiones, botón Work IQ) | M1 |
| Microsoft 365 Copilot: datos, privacidad y seguridad (learn.microsoft.com) | Protección de datos empresariales; respeto de permisos; no se usa para entrenar los modelos básicos | M1, M7 |
| [Use Copilot in Microsoft Teams meetings](https://support.microsoft.com/office/use-copilot-in-microsoft-teams-meetings-0bf9dd3c-96f7-44e2-8bb8-790bedf066b1) | La transcripción permite consultar la reunión después; al detenerla se detiene Copilot | M5 |
| [Use Researcher in Microsoft 365 Copilot Notebooks](https://support.microsoft.com/microsoft-365-copilot/use-researcher-in-microsoft-365-copilot-notebooks) | Researcher (investigación en varios pasos), Analyst, Notebooks y «Editar en Pages» | M6 |
| [Agent Builder / Copilot Studio agent builder](https://learn.microsoft.com/microsoft-365-copilot/extensibility/copilot-studio-agent-builder-build) | Agentes declarativos: nombre, descripción, instrucciones, conocimiento, prompts de inicio; diferencias con Copilot Studio | M7 |
| [Microsoft 365 Copilot blog: Agent Mode](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/agent-mode-general-availability/4488916) | Modo agente en Word, Excel y PowerPoint, disponible de forma general en abril de 2026 | M3 |
| [Customize how Microsoft 365 Copilot responds to you](https://support.microsoft.com/microsoft-365-copilot/customize-how-microsoft-365-copilot-responds-to-you) y avisos MC1158329 / RM574111 | Instrucciones personalizadas y memoria en Configuración → Personalización; ver y borrar recuerdos; fuentes de memoria en la respuesta; el administrador puede desactivarlo | M1 |
| [Classify and protect Copilot content with sensitivity labels](https://learn.microsoft.com/training/modules/purview-ai-secure-copilot/sensitivity-labels-copilot) | El contenido generado hereda la etiqueta más restrictiva de sus fuentes; el cifrado sin derechos impide a Copilot usar el documento; DLP basado en etiquetas | M1 |
| [Schedule your most used Copilot prompts](https://support.microsoft.com/microsoft-365-copilot/schedule-your-most-used-copilot-prompts) | «Programar este prompt», licencia necesaria, resultados en los chats, también en Teams y Outlook | M2, M5 |
| [Autonomous agents (Copilot Studio)](https://learn.microsoft.com/microsoft-copilot-studio/guidance/autonomous-agents) | Disparadores, instrucciones y guardarraíles; flujos como herramientas; aprobación humana en los flujos de agente | M7 |
| [Analyst agent in Microsoft 365 Copilot](https://techcommunity.microsoft.com/blog/Microsoft365CopilotBlog/analyst-agent-in-microsoft-365-copilot/4397191) | Agente de razonamiento que escribe, ejecuta y verifica Python en un entorno controlado; código revisable; Excel, CSV y otros formatos | M3, M4 |
| [Building Agent Mode in Excel](https://techcommunity.microsoft.com/blog/excelblog/building-agent-mode-in-excel/4457320) | Construcción en varios pasos con plan visible; 57,2 % en SpreadsheetBench en la vista previa; en algunas versiones se llama «Editar con Copilot» | M3 |
| [Copilot Cowork](https://www.microsoft.com/microsoft-365-copilot/cowork) | Encargo de un resultado, plan, ejecución en segundo plano y puntos de control para aprobar; usa tus permisos; facturación por uso | M5 |
| Anuncio de disponibilidad general de Copilot Cowork (16 de junio de 2026) | Requiere licencia de Microsoft 365 Copilot y consume Copilot Credits | M5, M7 |

## Decisiones de contenido

- **Prudencia con la interfaz.** Los nombres de botones cambian a menudo (por ejemplo, el selector Trabajo/Web y el botón Work IQ). Las lecciones explican el concepto y avisan de que la interfaz puede variar.
- **Sin precios ni límites concretos.** Las licencias, los créditos y los límites de uso (por ejemplo, de Researcher y Analyst) cambian con frecuencia; se remite a la organización.
- **Simulación declarada.** El Copilot de la app no usa IA. Cada respuesta indica que es una simulación y que el contenido generado por IA debe revisarse.
- **Datos ficticios.** Empresa, personas, importes, facturas y documentos son inventados.

## Pendiente de revisar en cada actualización

- Nombre y comportamiento del selector Trabajo/Web (Work IQ).
- Disponibilidad de Researcher, Analyst, Notebooks y Pages según licencia.
- Funciones del modo agente en cada app.
- Novedades de Agent Builder y Copilot Studio (tipos de conocimiento, acciones, disparadores y publicación).
- Comportamiento de la herencia de etiquetas en cada app (varía según la documentación consultada).
- Disponibilidad de la memoria y de los prompts programados según licencia y configuración.
