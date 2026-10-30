package vn.rentify;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:rentify;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.admin.email=admin@test.local",
        "app.admin.password=AdminTest123!",
        "app.jwt.secret=Rentify-Integration-Test-Key-At-Least-32-Bytes",
        "app.jwt.expiration-ms=3600000"
})
@AutoConfigureMockMvc
class RentifyWorkflowIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void landlordApprovalBookingAndInvoiceWorkflow() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Lan Nguyen","email":"landlord@test.local","password":"Landlord123!","role":"LANDLORD"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.approved").value(false));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"landlord@test.local","password":"Landlord123!"}
                                """))
                .andExpect(status().isForbidden());

        String adminToken = login("admin@test.local", "AdminTest123!");
        MvcResult pendingLandlords = mockMvc.perform(get("/api/admin/landlords/pending")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andReturn();
        long landlordId = objectMapper.readTree(pendingLandlords.getResponse().getContentAsString())
                .get(0).get("id").asLong();

        mockMvc.perform(patch("/api/admin/landlords/{id}/approval", landlordId)
                        .header("Authorization", bearer(adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"approved":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approved").value(true));

        String landlordToken = login("landlord@test.local", "Landlord123!");
        MvcResult createdRoom = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", bearer(landlordToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Phòng gần trường","address":"12 Nguyễn Trãi","area":"Quận 5","monthlyRent":3500000,"areaSquareMeters":24,"description":"Có cửa sổ","status":"AVAILABLE"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andReturn();
        long roomId = objectMapper.readTree(createdRoom.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Minh Tran","email":"tenant@test.local","password":"Tenant123!","role":"TENANT"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.approved").value(true));

        String tenantToken = login("tenant@test.local", "Tenant123!");
        LocalDate moveIn = LocalDate.now().plusDays(1);
        MvcResult createdBooking = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", bearer(tenantToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.createObjectNode()
                                .put("roomId", roomId)
                                .put("moveInDate", moveIn.toString())
                                .put("message", "Tôi muốn xem phòng")
                                .toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();
        long bookingId = objectMapper.readTree(createdBooking.getResponse().getContentAsString())
                .get("id").asLong();

        mockMvc.perform(patch("/api/bookings/{id}/decision", bookingId)
                        .header("Authorization", bearer(landlordToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"APPROVED"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(get("/api/rooms/{id}", roomId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RENTED"));

        String billingMonth = LocalDate.now().withDayOfMonth(1).toString();
        mockMvc.perform(post("/api/invoices")
                        .header("Authorization", bearer(landlordToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.createObjectNode()
                                .put("roomId", roomId)
                                .put("tenantId", tenantId(tenantToken))
                                .put("billingMonth", billingMonth)
                                .put("electricityAmount", 200000)
                                .put("waterAmount", 100000)
                                .put("serviceAmount", 50000)
                                .toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalAmount").value(3850000));

        mockMvc.perform(get("/api/invoices/mine")
                        .header("Authorization", bearer(tenantToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totalAmount").value(3850000));

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidInvoiceRevenue").value(0));
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.createObjectNode().put("email", email).put("password", password).toString()))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.get("accessToken").asText();
    }

    private long tenantId(String token) throws Exception {
        MvcResult result = mockMvc.perform(get("/api/bookings/mine")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get(0).get("tenantId").asLong();
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }
}
