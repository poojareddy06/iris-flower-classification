import io
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

class PDFReportService:
    @staticmethod
    def generate_model_report_pdf(model_data: Dict[str, Any]) -> bytes:
        """Generates a professional PDF technical evaluation report for a trained ML model."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#1e1b4b'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=12
        )
        section_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#4f46e5'),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155')
        )
        table_text = ParagraphStyle(
            'TableText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#1e293b')
        )
        table_head = ParagraphStyle(
            'TableHead',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#ffffff')
        )

        story = []

        # Title & Subtitle
        story.append(Paragraph("🌸 Iris AI – Model Evaluation & Technical Audit Report", title_style))
        story.append(Paragraph(
            f"Original Project: Iris Flower Species Classification Using Decision Tree | "
            f"Author: Pooja V (Edu Tantr, Bangalore) | Model ID: #{model_data.get('id', 'N/A')}",
            subtitle_style
        ))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366f1'), spaceAfter=12))

        # Core Metrics Summary Cards Table
        acc = f"{model_data.get('accuracy', 0.0) * 100:.1f}%"
        prec = f"{model_data.get('precision', 0.0) * 100:.1f}%"
        rec = f"{model_data.get('recall', 0.0) * 100:.1f}%"
        f1 = f"{model_data.get('f1_score', 0.0) * 100:.1f}%"

        metrics_data = [
            [
                Paragraph("<b>ACCURACY</b>", table_head),
                Paragraph("<b>PRECISION</b>", table_head),
                Paragraph("<b>RECALL</b>", table_head),
                Paragraph("<b>F1-SCORE</b>", table_head),
            ],
            [
                Paragraph(f"<font size=14 color='#16a34a'><b>{acc}</b></font>", body_style),
                Paragraph(f"<font size=14 color='#4f46e5'><b>{prec}</b></font>", body_style),
                Paragraph(f"<font size=14 color='#0284c7'><b>{rec}</b></font>", body_style),
                Paragraph(f"<font size=14 color='#7c3aed'><b>{f1}</b></font>", body_style),
            ]
        ]
        metrics_table = Table(metrics_data, colWidths=[135, 135, 135, 135])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f8fafc')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 10))

        # Model Specifications Section
        story.append(Paragraph("1. Architecture & Hyperparameters", section_style))
        specs_data = [
            [Paragraph("<b>Model Name:</b>", body_style), Paragraph(str(model_data.get('model_name', 'Decision Tree Classifier')), body_style)],
            [Paragraph("<b>Algorithm:</b>", body_style), Paragraph(str(model_data.get('algorithm', 'DecisionTreeClassifier')), body_style)],
            [Paragraph("<b>Splitting Criterion:</b>", body_style), Paragraph(f"{str(model_data.get('criterion', 'gini')).upper()} (Gini Impurity)", body_style)],
            [Paragraph("<b>Partition Split:</b>", body_style), Paragraph(f"{(1 - float(model_data.get('test_size', 0.2))) * 100:.0f}% Train / {float(model_data.get('test_size', 0.2)) * 100:.0f}% Test (Stratified)", body_style)],
            [Paragraph("<b>Random State:</b>", body_style), Paragraph(str(model_data.get('random_state', 42)), body_style)],
            [Paragraph("<b>Max Depth:</b>", body_style), Paragraph(str(model_data.get('hyperparameters', {}).get('max_depth', 'None (unrestricted)')) or 'None', body_style)],
            [Paragraph("<b>Min Samples Split / Leaf:</b>", body_style), Paragraph(f"{model_data.get('hyperparameters', {}).get('min_samples_split', 2)} / {model_data.get('hyperparameters', {}).get('min_samples_leaf', 1)}", body_style)],
        ]
        specs_table = Table(specs_data, colWidths=[160, 380])
        specs_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(specs_table)
        story.append(Spacer(1, 8))

        # Feature Importance Section
        story.append(Paragraph("2. Gini Feature Importances", section_style))
        fi = model_data.get('feature_importances', {})
        fi_rows = [[
            Paragraph("<b>Feature Name</b>", table_head),
            Paragraph("<b>Importance Weight</b>", table_head),
            Paragraph("<b>Botanical Contribution</b>", table_head),
        ]]
        for feat, score in fi.items():
            pct = score * 100
            note = "Dominant botanical discriminator (>90% predictive power)" if pct > 30 else "Secondary foliar measurement"
            fi_rows.append([
                Paragraph(f"<b>{feat}</b>", table_text),
                Paragraph(f"<b>{pct:.2f}%</b>", table_text),
                Paragraph(note, table_text)
            ])
        fi_table = Table(fi_rows, colWidths=[160, 120, 260])
        fi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(fi_table)
        story.append(Spacer(1, 8))

        # Confusion Matrix Section
        story.append(Paragraph("3. Unseen Test Set Confusion Matrix", section_style))
        cm = model_data.get('confusion_matrix', [])
        labels = model_data.get('target_names', ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'])
        
        cm_header = [Paragraph("<b>Actual \\ Predicted</b>", table_head)] + [Paragraph(f"<b>{lbl}</b>", table_head) for lbl in labels]
        cm_data = [cm_header]
        for idx, row in enumerate(cm):
            row_cells = [Paragraph(f"<b>{labels[idx]}</b>", table_text)]
            for val in row:
                row_cells.append(Paragraph(str(val), table_text))
            cm_data.append(row_cells)

        col_w = [180] + [120] * len(labels)
        cm_table = Table(cm_data, colWidths=col_w)
        cm_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4338ca')),
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#f1f5f9')),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(cm_table)
        story.append(Spacer(1, 14))

        # Footer notice
        story.append(Paragraph(
            f"Generated locally on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} • "
            "Iris AI Platform • Zero Paid API Dependencies • All metrics computed dynamically from trained scikit-learn models.",
            ParagraphStyle('Footer', parent=styles['Italic'], fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1)
        ))

        doc.build(story)
        return buffer.getvalue()

    @staticmethod
    def generate_predictions_pdf(predictions: List[Dict[str, Any]]) -> bytes:
        """Generates a PDF audit report of flower predictions history."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#1e1b4b'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=12
        )
        table_text = ParagraphStyle(
            'TableText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#1e293b')
        )
        table_head = ParagraphStyle(
            'TableHead',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#ffffff')
        )

        story = []
        story.append(Paragraph("🌸 Iris AI – Prediction History & Botanical Classification Log", title_style))
        story.append(Paragraph(
            f"Total Logged Records: {len(predictions)} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            subtitle_style
        ))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#6366f1'), spaceAfter=10))

        headers = [
            Paragraph("<b># ID</b>", table_head),
            Paragraph("<b>Timestamp</b>", table_head),
            Paragraph("<b>Sepal (L x W)</b>", table_head),
            Paragraph("<b>Petal (L x W)</b>", table_head),
            Paragraph("<b>Predicted Species</b>", table_head),
            Paragraph("<b>Confidence</b>", table_head),
        ]
        table_data = [headers]

        for p in predictions[:100]: # Up to 100 rows in PDF
            sl = p.get('sepal_length', '')
            sw = p.get('sepal_width', '')
            pl = p.get('petal_length', '')
            pw = p.get('petal_width', '')
            species = p.get('predicted_species', '')
            conf = f"{float(p.get('confidence', 1.0)) * 100:.1f}%"
            ts = str(p.get('created_at', ''))[:16].replace('T', ' ')
            table_data.append([
                Paragraph(str(p.get('id', '')), table_text),
                Paragraph(ts, table_text),
                Paragraph(f"{sl} x {sw} cm", table_text),
                Paragraph(f"{pl} x {pw} cm", table_text),
                Paragraph(f"<b>{species}</b>", table_text),
                Paragraph(conf, table_text),
            ])

        t = Table(table_data, colWidths=[40, 110, 100, 100, 130, 60])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f8fafc')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (5, 0), (5, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(t)
        story.append(Spacer(1, 14))

        story.append(Paragraph(
            "Iris AI Platform • Supervised Decision Tree Classification • Edu Tantr Internship Project",
            ParagraphStyle('Footer', parent=styles['Italic'], fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1)
        ))

        doc.build(story)
        return buffer.getvalue()

    @staticmethod
    def generate_dataset_summary_pdf(dataset_data: Dict[str, Any]) -> bytes:
        """Generates a PDF summary report of dataset diagnostics."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#1e1b4b'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=12
        )
        section_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#0284c7'),
            spaceBefore=10,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        table_text = ParagraphStyle(
            'TableText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#1e293b')
        )
        table_head = ParagraphStyle(
            'TableHead',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#ffffff')
        )

        story = []
        story.append(Paragraph("🌸 Iris AI – Dataset Audit & Diagnostics Report", title_style))
        story.append(Paragraph(
            f"Dataset: {dataset_data.get('filename', 'iris.csv')} | "
            f"Audit Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            subtitle_style
        ))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#0284c7'), spaceAfter=10))

        # Summary Table
        summary_info = [
            [Paragraph("<b>Filename:</b>", body_style), Paragraph(str(dataset_data.get('filename')), body_style)],
            [Paragraph("<b>Validation Status:</b>", body_style), Paragraph("VALID (Ready for Model Training)" if dataset_data.get('is_valid') else "INVALID (Missing Required Columns)", body_style)],
            [Paragraph("<b>Total Rows:</b>", body_style), Paragraph(str(dataset_data.get('row_count')), body_style)],
            [Paragraph("<b>Total Columns:</b>", body_style), Paragraph(str(dataset_data.get('col_count')), body_style)],
            [Paragraph("<b>Duplicate Rows:</b>", body_style), Paragraph(str(dataset_data.get('duplicate_rows', 0)), body_style)],
            [Paragraph("<b>Validation Details:</b>", body_style), Paragraph(str(dataset_data.get('validation_message', '')), body_style)],
        ]
        st = Table(summary_info, colWidths=[150, 390])
        st.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f9ff')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bae6fd')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(st)
        story.append(Spacer(1, 10))

        # Class Distribution Table
        story.append(Paragraph("Class Distribution", section_style))
        cd = dataset_data.get('class_distribution', {})
        cd_data = [[Paragraph("<b>Species Class</b>", table_head), Paragraph("<b>Sample Count</b>", table_head), Paragraph("<b>Proportion</b>", table_head)]]
        tot = sum(cd.values()) if cd else 1
        for cls, count in cd.items():
            cd_data.append([
                Paragraph(f"<b>{cls}</b>", table_text),
                Paragraph(str(count), table_text),
                Paragraph(f"{count / tot * 100:.1f}%", table_text),
            ])
        cdt = Table(cd_data, colWidths=[200, 140, 200])
        cdt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f0f9ff')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bae6fd')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(cdt)

        story.append(Spacer(1, 14))
        story.append(Paragraph(
            "Iris AI Platform • Dataset Intelligence Center • All computations generated natively via pandas.",
            ParagraphStyle('Footer', parent=styles['Italic'], fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1)
        ))

        doc.build(story)
        return buffer.getvalue()
