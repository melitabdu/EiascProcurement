import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./AdminQuotationsPage.css";
import CommitteeMinutesForm from "./CommiteeMinutesForm";

const AdminQuotationSummary = ({ procurementId }) => {
  const [summary, setSummary] = useState(null);
  const [minutesData, setMinutesData] = useState(null);
  const [openingMembers, setOpeningMembers] = useState([]);
  const [showMinutesForm, setShowMinutesForm] = useState(false);

  const token = localStorage.getItem("adminToken");
  const copyRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {

        /* ================= SUMMARY ================= */

        const summaryRes = await axios.get(
          `http://localhost:5000/api/invitations/summary/${procurementId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSummary(summaryRes.data);

        /* ================= PROCUREMENT ================= */

        const procurementRes = await axios.get(
          `http://localhost:5000/api/procurements/${procurementId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const openMembers =
          procurementRes.data.bidOpenedBy?.map((m) => ({
            name: m.fullName,
            id: m._id,
          })) || [];

        setOpeningMembers(openMembers);

        /* ================= LOAD MINUTES ================= */

        try {
          const minutesRes = await axios.get(
            `http://localhost:5000/api/committee-minutes/procurement/${procurementId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setMinutesData(minutesRes.data);
        } catch {
          setMinutesData(null);
        }

      } catch (err) {
        console.log("Load error", err);
      }
    };

    loadData();
  }, [procurementId, token]);

  if (!summary) return <p>Loading...</p>;

  const { procurement, businesses = [], items = [] } = summary;

  const formattedDate = minutesData?.meetingDate
    ? new Date(minutesData.meetingDate).toLocaleDateString("am-ET")
    : "";

  /* ================= PDF DOWNLOAD ================= */

  const handlePDFDownload = async () => {
    try {

      const response = await axios.get(
        `http://localhost:5000/api/committee-minutes/${procurementId}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      window.open(url);

    } catch {
      alert("PDF generation failed");
    }
  };

  /* ================= COPY WITH FORMATTING ================= */

  const handleCopySection = async () => {

    if (!copyRef.current) return;

    const htmlContent = copyRef.current.outerHTML;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const data = [new ClipboardItem({ "text/html": blob })];

    try {
      await navigator.clipboard.write(data);
      alert("Formatted report copied. Paste it into Word.");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div className="official-report">

      {/* COPYABLE SECTION */}

      <div ref={copyRef}>

        {/* HEADER */}

        <div className="report-header">
          <h1>የኢትዮጵያ እስልምና ጉዳይ ጠቅላይ ምክር ቤት</h1>
          <h2>የግዥ ጨረታ ግምገማ ቃለ ጉባኤ</h2>
        </div>

        {/* PROCUREMENT INFO */}

        <div className="reference-section">
          <p>የጨረታ ርዕስ: {procurement.title}</p>
          <p>የጨረታ መለያ ቁጥር: {procurement.referenceNumber}</p>
          <p>የጠየቀ ክፍል: {procurement.requestingDepartment}</p>

          {minutesData && (
            <>
              <p>ቀን: {formattedDate}</p>
              <p>ቦታ: {minutesData.meetingPlace}</p>
            </>
          )}
        </div>

        {/* SUMMARY TABLE */}

        <div className="section-title">
          1. የጨረታ ዋጋ ማጠቃለያ ሰንጠረዥ
        </div>

        <table className="summary-table">

          <thead>
            <tr>
              <th>ተ.ቁ</th>
              <th>የእቃ ስም</th>
              <th>መለኪያ</th>

              {businesses.map((b, index) => (
                <th key={b.businessId || index}>{b.name}</th>
              ))}

              <th>አሸናፊ</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 ? (
              <tr>
                <td colSpan={4 + businesses.length}>
                  No quotation data available
                </td>
              </tr>
            ) : (
              items.map((item, index) => (

                <tr key={item._id || index}>

                  <td>{index + 1}</td>
                  <td>{item.itemName || "-"}</td>
                  <td>{item.unit || "-"}</td>

                  {businesses.map((b, i) => {

                    const quote = Array.isArray(item.quotes)
                      ? item.quotes.find(
                          (q) => q.businessId === b.businessId
                        )
                      : item.quotes?.[b.businessId];

                    return (
                      <td key={`${index}-${i}`}>
                        {quote?.unitPrice ?? "-"}
                      </td>
                    );
                  })}

                  <td>
                    {businesses.find(
                      (b) => b.businessId === item.winnerBusinessId
                    )?.name || "-"}
                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

        {/* BID OPENING COMMITTEE */}

        <div className="section-title">
          2. የጨረታ ክፍት ኮሚቴ አባላት
        </div>

        <div className="committee-list">

          {openingMembers.length === 0 ? (
            <p>ኮሚቴ አባላት አልተመዘገቡም</p>
          ) : (
            openingMembers.map((m, i) => (
              <p key={m.id || i}>
                {i + 1}. {m.name}
              </p>
            ))
          )}

        </div>

      </div>

      {/* MINUTES SECTION */}

      {minutesData && (
        <>

          <div className="section-title">3. የግምገማ ሪፖርት</div>

          <div className="paragraph-block">
            {minutesData.evaluationReport}
          </div>

          <div className="section-title">4. የኮሚቴ ውሳኔ</div>

          <div className="paragraph-block">
            {minutesData.decisionText}
          </div>

          <div className="section-title">5. የአስተዳደር ውሳኔ</div>

          <div className="managerial-line"></div>
          <div className="managerial-line"></div>

          <div className="signature-section">
            <div className="signature-line"></div>
            <div className="signature-name">ዋና ሥራ አስኪያጅ</div>
          </div>

          <div className="clear-fix"></div>

          <div className="section-title">
            6. የግምገማ ኮሚቴ ፊርማ
          </div>

          {minutesData.committeeMembers?.map((m, i) => (
            <div key={m._id || m.name || i} style={{ marginTop: "25px" }}>
              <p>
                {m.name} - {m.role}
              </p>
              <div className="signature-line"></div>
            </div>
          ))}

        </>
      )}

      {/* BUTTONS */}

      <div className="no-print">

        <button onClick={handleCopySection}>
          📋 Copy Report Section (Formatted)
        </button>

        <button onClick={() => setShowMinutesForm(!showMinutesForm)}>
          {minutesData ? "✏ አርትዕ ቃለ ጉባኤ" : "📝 ቃለ ጉባኤ ጨምር"}
        </button>

        <button onClick={handlePDFDownload}>
          🖨 ኦፊሴላዊ PDF አትም
        </button>

      </div>

      {showMinutesForm && (
        <CommitteeMinutesForm
          procurementId={procurementId}
          onSaved={(data) => {
            setMinutesData(data);
            setShowMinutesForm(false);
          }}
        />
      )}

    </div>
  );
};

export default AdminQuotationSummary;